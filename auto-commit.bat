@echo off
chcp 65001 >nul
setlocal
title GitHub 자동 커밋 v1.0.0

rem ================= 설정 - 필요하면 여기만 수정 =================
set "OWNER=12Cchris"
set "REPO=ieum-central-bureau"
set "BRANCH=main"
rem ===============================================================

cd /d "%~dp0"
echo.
echo  === GitHub 자동 커밋 v1.0.0 ===
echo  작업 폴더: %CD%
echo.

rem ---------- 1. Git 설치 확인 ----------
where git >nul 2>nul
if errorlevel 1 goto :nogit

rem ---------- 2. 저장소 초기화 ----------
if exist ".git" goto :checkremote
git init >nul
git branch -M %BRANCH%
echo  [완료] 새 Git 저장소를 만들었습니다.

rem ---------- 3. GitHub 저장소 연결 ----------
:checkremote
git remote get-url origin >nul 2>nul
if not errorlevel 1 goto :hasremote

echo  [안내] GitHub 저장소가 아직 연결되지 않았습니다.
where gh >nul 2>nul
if errorlevel 1 goto :manualremote

gh auth status >nul 2>nul
if errorlevel 1 (
  echo  GitHub 로그인이 필요합니다. 안내에 따라 진행해 주세요.
  gh auth login
)
gh auth setup-git >nul 2>nul

set "INPUT="
set /p INPUT= 저장소 이름 - 그냥 Enter 누르면 %REPO% 사용:
if defined INPUT set "REPO=%INPUT%"

gh repo create %OWNER%/%REPO% --public --source=. --remote=origin
if errorlevel 1 (
  echo  [안내] 새로 만들지 못해 이미 있는 저장소로 연결을 시도합니다.
  git remote add origin https://github.com/%OWNER%/%REPO%.git
) else (
  set "NEWREPO=1"
)
goto :hasremote

:manualremote
set "URL="
set /p URL= GitHub 저장소 주소를 붙여넣고 Enter:
if not defined URL goto :fail
git remote add origin "%URL%"

rem ---------- 4. 사용자 정보 확인 ----------
:hasremote
set "GNAME="
for /f "delims=" %%A in ('git config user.name 2^>nul') do set "GNAME=%%A"
if defined GNAME goto :nameok
set /p GNAME= Git 사용자 이름을 입력하세요:
git config user.name "%GNAME%"
:nameok

set "GMAIL="
for /f "delims=" %%A in ('git config user.email 2^>nul') do set "GMAIL=%%A"
if defined GMAIL goto :mailok
set /p GMAIL= GitHub 이메일을 입력하세요:
git config user.email "%GMAIL%"
:mailok

rem ---------- 5. 커밋 메시지 ----------
set "MSG=%~1"
if defined MSG goto :commit
set /p MSG= 커밋 메시지 - 그냥 Enter 누르면 자동 메시지:
if defined MSG goto :commit
for /f "delims=" %%T in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH:mm"') do set "STAMP=%%T"
set "STAMP=%STAMP:_= %"
set "MSG=자동 업데이트 %STAMP%"

rem ---------- 6. 커밋 ----------
:commit
set "MSG=%MSG:"=%"
git add -A
git diff --cached --quiet
if errorlevel 1 goto :docommit
echo  [안내] 새로 바뀐 파일이 없어 커밋은 건너뜁니다.
goto :push
:docommit
git commit -m "%MSG%"
if errorlevel 1 goto :fail

rem ---------- 7. 가져오기 후 올리기 ----------
:push
git ls-remote --exit-code --heads origin %BRANCH% >nul 2>nul
if errorlevel 1 goto :dopush
git pull --rebase origin %BRANCH%
if errorlevel 1 goto :conflict
:dopush
git push -u origin %BRANCH%
if errorlevel 1 goto :fail

if defined NEWREPO gh api -X POST repos/%OWNER%/%REPO%/pages -f "source[branch]=%BRANCH%" -f "source[path]=/" >nul 2>nul

echo.
echo  [완료] GitHub에 올렸습니다.
echo  사이트 주소: https://%OWNER%.github.io/%REPO%/
echo  처음 올렸다면 사이트에 반영되기까지 1~2분 걸릴 수 있습니다.
echo.
pause
exit /b 0

:nogit
echo  [오류] Git이 설치되어 있지 않습니다.
echo  https://git-scm.com/download/win 에서 설치한 뒤 다시 실행해 주세요.
echo.
pause
exit /b 1

:conflict
echo.
echo  [오류] GitHub의 내용과 합치는 중 충돌이 났습니다.
echo  충돌난 파일을 직접 고친 뒤 git rebase --continue 를 실행하거나,
echo  git rebase --abort 로 되돌린 다음 다시 시도해 주세요.
echo.
pause
exit /b 1

:fail
echo.
echo  [오류] 중간에 실패했습니다. 위에 나온 메시지를 확인해 주세요.
echo.
pause
exit /b 1
