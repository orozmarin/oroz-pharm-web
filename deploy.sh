#!/usr/bin/env bash
#
# Deploy na produkciju (Hetzner) + git tag verzije.
#
#   ./deploy.sh v1.3.0
#   ./deploy.sh v1.3.0 "Perad kategorija + migracija materijala"
#
# Pokreće se LOKALNO. Redoslijed je namjeran: tag nastaje tek nakon što build,
# restart i smoke test prođu, pa svaki tag odgovara nečemu što stvarno radi na
# produkciji. Ako deploy pukne, taga nema i ništa se ne mora povlačiti natrag.
#
set -euo pipefail

SERVER="root@128.140.74.214"
SSH_KEY="$HOME/.ssh/id_ed25519_orozpharm"
APP_DIR="/var/www/orozpharm"
PM2_APP="orozpharm"
BRANCH="main"

# gh credential helper servira samo aktivni račun, pa push ide kao krivi korisnik
# ako je aktivan neki drugi. Skripta prebaci i vrati natrag.
GH_PUSH_USER="orozmarin"

SMOKE_URLS=(
  "https://orozpharm.hr/"
  "https://orozpharm.hr/blog"
  "https://orozpharm.hr/proizvodi"
  "https://orozpharm.hr/kontakt"
)

step()  { printf "\n\033[1;32m▶ %s\033[0m\n" "$*"; }
info()  { printf "  %s\n" "$*"; }
die()   { printf "\n\033[1;31m✗ %s\033[0m\n" "$*" >&2; exit 1; }

VERSION="${1:-}"
TAG_MESSAGE="${2:-}"

[[ -n "$VERSION" ]] || die "Nedostaje verzija.  Primjer: ./deploy.sh v1.3.0"
[[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "Verzija mora biti oblika vX.Y.Z (dobio: $VERSION)"
TAG_MESSAGE="${TAG_MESSAGE:-$VERSION}"

cd "$(dirname "$0")"

# ─── 1. Provjere prije nego išta diramo ──────────────────────────────────────
step "[1/6] Provjera lokalnog stanja"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[[ "$CURRENT_BRANCH" == "$BRANCH" ]] || die "Nisi na $BRANCH nego na $CURRENT_BRANCH."

# Namjerno samo praćene datoteke — seed/import skripte stoje untracked i to je u redu.
git diff --quiet && git diff --cached --quiet \
  || die "Radno stablo ima necommitane izmjene praćenih datoteka. Commitaj ih ili stashaj."

git tag -l "$VERSION" | grep -q . && die "Tag $VERSION već postoji lokalno."

git fetch --quiet origin "$BRANCH" --tags
git ls-remote --tags origin "refs/tags/$VERSION" | grep -q . && die "Tag $VERSION već postoji na originu."

LOCAL="$(git rev-parse "$BRANCH")"
REMOTE="$(git rev-parse "origin/$BRANCH")"
[[ "$LOCAL" == "$REMOTE" ]] \
  || die "$BRANCH i origin/$BRANCH se razlikuju. Pushaj (ili pullaj) prije deploya."

info "grana:  $BRANCH @ ${LOCAL:0:7}"
info "verzija: $VERSION"

# ─── 2-5. Deploy na server ───────────────────────────────────────────────────
step "[2/6] Pull na serveru"
ssh -i "$SSH_KEY" "$SERVER" "cd $APP_DIR && git pull --ff-only" | tail -3

DEPLOYED="$(ssh -i "$SSH_KEY" "$SERVER" "cd $APP_DIR && git rev-parse HEAD")"
[[ "$DEPLOYED" == "$LOCAL" ]] \
  || die "Server je na ${DEPLOYED:0:7}, a očekivano je ${LOCAL:0:7}. Provjeri stanje repoa na serveru."

step "[3/6] Build"
# nvm se ne učitava u neinteraktivnom SSH-u, pa node/pm2 nisu na PATH-u bez ovoga.
ssh -i "$SSH_KEY" "$SERVER" bash <<EOF | tail -5
  set -e
  export NVM_DIR="\$HOME/.nvm"; . "\$NVM_DIR/nvm.sh"
  cd $APP_DIR
  npm run build
EOF

step "[4/6] Restart"
ssh -i "$SSH_KEY" "$SERVER" bash <<EOF | tail -3
  set -e
  export NVM_DIR="\$HOME/.nvm"; . "\$NVM_DIR/nvm.sh"
  pm2 flush $PM2_APP >/dev/null
  pm2 restart $PM2_APP --update-env
EOF

step "[5/6] Smoke test"
sleep 3
FAILED=0
for url in "${SMOKE_URLS[@]}"; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$url" || echo 000)"
  printf "  %-40s %s\n" "$url" "$code"
  [[ "$code" == "200" ]] || FAILED=1
done
[[ "$FAILED" -eq 0 ]] || die "Smoke test pao — tag NIJE napravljen. Provjeri: ssh -i $SSH_KEY $SERVER 'pm2 logs $PM2_APP --lines 40 --nostream'"

# ─── 6. Tag tek kad je sve prošlo ────────────────────────────────────────────
step "[6/6] Tag $VERSION"

git tag -a "$VERSION" -m "$TAG_MESSAGE"

ACTIVE_GH_USER="$(gh auth status --active 2>/dev/null | sed -n 's/.*account \([^ ]*\) .*/\1/p' | head -1 || true)"
SWITCHED=0
if [[ -n "$ACTIVE_GH_USER" && "$ACTIVE_GH_USER" != "$GH_PUSH_USER" ]]; then
  info "gh: $ACTIVE_GH_USER → $GH_PUSH_USER (privremeno)"
  gh auth switch --user "$GH_PUSH_USER" >/dev/null
  SWITCHED=1
  # Vrati aktivni račun i ako push pukne, inače pucaju ostali repoi.
  trap 'gh auth switch --user "$ACTIVE_GH_USER" >/dev/null 2>&1 || true' EXIT
fi

git push origin "$VERSION"

if [[ "$SWITCHED" -eq 1 ]]; then
  gh auth switch --user "$ACTIVE_GH_USER" >/dev/null
  trap - EXIT
  info "gh: vraćen $ACTIVE_GH_USER"
fi

printf "\n\033[1;32m✓ %s je na produkciji i otagiran.\033[0m\n" "$VERSION"
