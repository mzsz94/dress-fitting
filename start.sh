#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 스크립트 위치 저장
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${GREEN}🍌 Nano Banana Wedding 프로젝트를 시작합니다...${NC}"

# 백엔드 시작
echo -e "${GREEN}>> Backend 서버 실행 중 (Port 2000)...${NC}"
cd "$SCRIPT_DIR/backend" || exit
node index.js > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# 프론트엔드 시작
echo -e "${GREEN}>> Frontend 서버 실행 중...${NC}"
cd "$SCRIPT_DIR/frontend" || exit
npm run dev -- --host > "$SCRIPT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}>> 서버가 백그라운드에서 실행 중입니다.${NC}"
echo -e "Frontend: https://sz-code.mzsz.site/proxy/5173/"
echo -e "Backend Log: $SCRIPT_DIR/backend.log"
echo -e "Frontend Log: $SCRIPT_DIR/frontend.log"

# 스크립트 종료 시 프로세스 함께 종료하고 싶다면 'wait'를 사용하세요.
# 현재는 백그라운드에서 계속 실행되도록 유지합니다.
# trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait $BACKEND_PID $FRONTEND_PID