/* 기능: 화면 그리기·검색·모달·전자민원 등 모든 동작 (data.js 다음에 불러와야 함) */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ADMIN_PASSWORD_SHA256 = '4a65d874a5cbe25286e5d5d6db3ce24fc06c9d99eef619718fe839941cecc39c';
const ADMIN_SESSION_KEY = 'ieumAdminSession';
const ADMIN_BLOCK_KEY = 'ieumAgencyBlocks';
const ADMIN_LOG_KEY = 'ieumAdminLog';

/* 1. 공식 직인(관인) SVG 생성 함수 */
const SEAL_GLYPHS = {
  '이': 'M77.2 1.3H88.4V98.7H77.2ZM36.7 8.4Q43.9 8.4 49.6 12.7Q55.3 16.9 58.5 24.6Q61.7 32.2 61.7 42.7Q61.7 53.2 58.5 60.9Q55.3 68.6 49.6 72.8Q43.9 77 36.7 77Q29.5 77 23.8 72.8Q18.1 68.6 14.8 60.9Q11.6 53.2 11.6 42.7Q11.6 32.2 14.8 24.6Q18.1 16.9 23.8 12.7Q29.5 8.4 36.7 8.4ZM36.7 18.5Q32.4 18.5 29.2 21.4Q26 24.3 24.1 29.7Q22.3 35.1 22.3 42.7Q22.3 50.3 24.1 55.7Q26 61.2 29.2 64.1Q32.4 67 36.7 67Q41 67 44.1 64.1Q47.3 61.2 49.1 55.7Q51 50.3 51 42.7Q51 35.1 49.1 29.7Q47.3 24.3 44.1 21.4Q41 18.5 36.7 18.5Z',
  '음': 'M50 3Q60.6 3 68.4 5.2Q76.2 7.4 80.4 11.6Q84.6 15.7 84.6 21.7Q84.6 27.4 80.4 31.6Q76.2 35.9 68.4 38Q60.6 40.2 50 40.2Q39.5 40.2 31.6 38Q23.8 35.9 19.6 31.6Q15.3 27.4 15.3 21.7Q15.3 15.7 19.6 11.6Q23.8 7.4 31.6 5.2Q39.5 3 50 3ZM50 11.7Q42.8 11.7 37.6 12.9Q32.3 14 29.6 16.2Q26.8 18.4 26.8 21.7Q26.8 24.8 29.6 27Q32.3 29.3 37.6 30.4Q42.8 31.6 50 31.6Q57.2 31.6 62.4 30.4Q67.6 29.3 70.3 27Q73.1 24.8 73.1 21.7Q73.1 18.4 70.3 16.2Q67.6 14 62.4 12.9Q57.2 11.7 50 11.7ZM16.6 64.6H83.3V97H16.6ZM72.3 73.4H27.4V88.2H72.3ZM6.1 47.3H93.9V56.3H6.1Z',
  '중': 'M44.4 48H55.5V65.1H44.4ZM6.1 44.3H93.9V53.2H6.1ZM49.8 61.8Q65.5 61.8 74.4 66.3Q83.3 70.9 83.3 79.1Q83.3 87.4 74.4 91.9Q65.5 96.4 49.8 96.4Q34.1 96.4 25.3 91.9Q16.4 87.4 16.4 79.1Q16.4 70.9 25.3 66.3Q34.1 61.8 49.8 61.8ZM49.8 70.4Q42.8 70.4 37.8 71.4Q32.8 72.4 30.2 74.4Q27.6 76.3 27.6 79.1Q27.6 82 30.2 84Q32.8 86 37.8 86.9Q42.8 87.9 49.8 87.9Q57 87.9 62 86.9Q66.9 86 69.5 84Q72 82 72 79.1Q72 76.3 69.5 74.4Q66.9 72.4 62 71.4Q57 70.4 49.8 70.4ZM42.6 7.9H52.4V10.5Q52.4 15.1 50.6 19.1Q48.8 23.1 45.4 26.4Q42 29.8 37.3 32.4Q32.7 35.1 26.9 36.8Q21.1 38.5 14.4 39.3L10.4 30.5Q16.2 30 21.1 28.7Q26.1 27.3 30 25.4Q33.9 23.5 36.7 21.1Q39.5 18.7 41 16Q42.6 13.3 42.6 10.5ZM47.6 7.9H57.4V10.5Q57.4 13.4 58.9 16.1Q60.4 18.8 63.2 21.2Q66 23.5 69.9 25.4Q73.9 27.3 78.9 28.7Q83.8 30 89.6 30.5L85.6 39.3Q78.9 38.5 73.1 36.8Q67.3 35.1 62.6 32.5Q57.9 29.9 54.5 26.5Q51.2 23.2 49.4 19.1Q47.6 15 47.6 10.5ZM14 3.6H86V12.4H14Z',
  '앙': 'M31.6 7Q39 7 44.9 10Q50.7 13 54.1 18.2Q57.4 23.4 57.4 30.2Q57.4 37 54.1 42.2Q50.7 47.4 44.9 50.4Q39 53.4 31.6 53.4Q24.3 53.4 18.4 50.4Q12.6 47.4 9.2 42.2Q5.9 37 5.9 30.2Q5.9 23.4 9.2 18.2Q12.6 13 18.4 10Q24.3 7 31.6 7ZM31.6 16.4Q27.3 16.4 24 18.1Q20.6 19.8 18.7 22.9Q16.7 26.1 16.7 30.2Q16.7 34.5 18.7 37.6Q20.6 40.6 24 42.3Q27.3 44 31.6 44Q36 44 39.4 42.3Q42.8 40.6 44.7 37.6Q46.6 34.5 46.6 30.2Q46.6 26.1 44.7 22.9Q42.8 19.8 39.4 18.1Q36 16.4 31.6 16.4ZM69.4 1.5H80.4V58.6H69.4ZM77.4 24.7H94.1V33.8H77.4ZM49.1 61.3Q59.1 61.3 66.4 63.5Q73.6 65.7 77.6 69.9Q81.5 74 81.5 79.9Q81.5 85.7 77.6 89.9Q73.6 94 66.4 96.3Q59.1 98.5 49.1 98.5Q39.1 98.5 31.9 96.3Q24.7 94 20.7 89.9Q16.8 85.7 16.8 79.9Q16.8 74 20.7 69.9Q24.7 65.7 31.9 63.5Q39.1 61.3 49.1 61.3ZM49.1 70.1Q42.4 70.1 37.7 71.2Q32.9 72.3 30.3 74.5Q27.8 76.7 27.8 79.9Q27.8 83.1 30.3 85.3Q32.9 87.6 37.7 88.7Q42.4 89.8 49.1 89.8Q56 89.8 60.7 88.7Q65.4 87.6 68 85.3Q70.5 83.1 70.5 79.9Q70.5 76.7 68 74.5Q65.4 72.3 60.7 71.2Q56 70.1 49.1 70.1Z',
  '관': 'M10.6 9.7H53.1V18.7H10.6ZM24.1 31.9H35.1V56.2H24.1ZM48.6 9.7H59.6V15.3Q59.6 20.2 59.3 27.4Q59 34.6 57.2 44L46.3 42.8Q48.1 33.5 48.4 26.9Q48.6 20.2 48.6 15.3ZM71.2 2.3H82.3V75.4H71.2ZM77.7 33.2H95.2V42.3H77.7ZM19.4 88.6H85.5V97.7H19.4ZM19.4 68.8H30.5V91.4H19.4ZM6 61.1 4.8 52Q13.4 52 23.7 51.9Q33.9 51.7 44.7 51Q55.4 50.3 65.2 48.9L66 57Q55.9 58.7 45.2 59.6Q34.6 60.5 24.5 60.7Q14.5 61 6 61.1Z',
  '리': 'M76.3 1.3H87.5V98.7H76.3ZM12.7 66.4H21Q29.4 66.4 37.1 66.1Q44.8 65.9 52.5 65.1Q60.2 64.4 68.4 63.1L69.4 72.1Q56.9 74.3 45.4 74.9Q33.9 75.6 21 75.6H12.7ZM12.5 10H57.9V46H24V69.9H12.7V37.1H46.5V19H12.5Z',
  '국': 'M17 3.6H79.1V12.5H17ZM6 37.7H94V46.8H6ZM44.4 44H55.4V65.8H44.4ZM72.1 3.6H83.1V10.9Q83.1 17.1 82.7 24.6Q82.3 32.2 80 42L69 40.9Q71.4 31.2 71.8 24.1Q72.1 17 72.1 10.9ZM15 62.7H83.5V96.4H72.3V71.6H15Z',
  '장': 'M28.5 12H37.7V19.1Q37.7 28.2 34.5 36.2Q31.3 44.1 25.2 50.1Q19.1 56 10.4 59L4.8 50.2Q12.4 47.6 17.8 42.8Q23.1 38 25.8 31.9Q28.5 25.7 28.5 19.1ZM30.7 12H39.8V19.1Q39.8 25.1 42.4 30.6Q45.1 36.2 50.2 40.5Q55.3 44.8 62.7 47.1L57.3 55.9Q48.7 53.1 42.8 47.7Q36.9 42.2 33.8 34.8Q30.7 27.4 30.7 19.1ZM7.9 8.3H60.1V17.3H7.9ZM70.4 1.5H81.5V59.6H70.4ZM78.5 25.1H95.2V34.3H78.5ZM50.2 61.8Q60.2 61.8 67.4 64Q74.7 66.2 78.6 70.3Q82.6 74.4 82.6 80.1Q82.6 86 78.6 90.1Q74.7 94.1 67.4 96.3Q60.2 98.5 50.2 98.5Q40.2 98.5 32.9 96.3Q25.6 94.1 21.8 90.1Q17.9 86 17.9 80.1Q17.9 74.4 21.8 70.3Q25.6 66.2 32.9 64Q40.2 61.8 50.2 61.8ZM50.2 70.6Q43.5 70.6 38.7 71.7Q33.9 72.8 31.4 74.9Q28.8 77 28.8 80.1Q28.8 83.3 31.4 85.5Q33.9 87.7 38.7 88.8Q43.5 89.9 50.2 89.9Q57 89.9 61.8 88.8Q66.5 87.7 69 85.5Q71.6 83.3 71.6 80.1Q71.6 77 69 74.9Q66.5 72.8 61.8 71.7Q57 70.6 50.2 70.6Z',
  '인': 'M76.6 2.4H87.8V72.9H76.6ZM24.4 88.6H90.5V97.6H24.4ZM24.4 65.8H35.4V92.1H24.4ZM35.3 8.9Q42.7 8.9 48.5 12Q54.4 15.1 57.8 20.5Q61.2 26 61.2 33.1Q61.2 40.2 57.8 45.7Q54.4 51.2 48.5 54.3Q42.7 57.4 35.3 57.4Q28 57.4 22.1 54.3Q16.3 51.2 12.9 45.7Q9.5 40.2 9.5 33.1Q9.5 26 12.9 20.5Q16.3 15.1 22.1 12Q28 8.9 35.3 8.9ZM35.3 18.6Q31.1 18.6 27.7 20.4Q24.3 22.2 22.3 25.4Q20.4 28.7 20.4 33.1Q20.4 37.6 22.3 40.9Q24.3 44.1 27.7 45.9Q31.1 47.7 35.3 47.7Q39.6 47.7 43 45.9Q46.4 44.1 48.4 40.9Q50.3 37.6 50.3 33.1Q50.3 28.7 48.4 25.4Q46.4 22.2 43 20.4Q39.6 18.6 35.3 18.6Z'
};

/* 관인(직인): "이음중앙관리국장인" 9글자를 가로로 3×3 칸에 새김 (왼쪽 → 오른쪽, 위 → 아래).
   글자는 Noto Sans KR Medium의 윤곽선(SVG path)을 원래 비율 그대로 칸 중앙에 놓은 것이라 폰트가 없어도 어디서나 같게 보입니다.
   path는 모든 글자에 같은 배율을 적용해 0~100 정사각 범위의 중앙에 맞춰 두었습니다. */
function makeGovSeal(sz) {
  const RED = '#c4161c';
  const TXT = '이음중앙관리국장인';
  const AREA = 76, CELL = AREA / 3, G = 23.6;       /* 글씨 영역 76, 칸 25.3, 글자 크기 23.6 */
  const S = G / 100, OFF = (100 - AREA) / 2;
  let g = '';
  TXT.split('').forEach((c, i) => {
    const cx = OFF + (i % 3) * CELL + CELL / 2 - G / 2;
    const cy = OFF + Math.floor(i / 3) * CELL + CELL / 2 - G / 2;
    g += `<path transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${S})" d="${SEAL_GLYPHS[c]}" fill="${RED}" stroke="${RED}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
  });
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 100 100" role="img" aria-label="이음중앙관리국장 직인">
    <rect width="100" height="100" rx="9" fill="#fffdf8"/>
    <rect x="4.5" y="4.5" width="91" height="91" rx="2.5" fill="none" stroke="${RED}" stroke-width="4.4"/>
    <rect x="10" y="10" width="80" height="80" rx="1" fill="none" stroke="${RED}" stroke-width="0.8"/>
    ${g}
  </svg>`;
}

$('sealBig').innerHTML = makeGovSeal(100);
$('sealFoot').innerHTML = makeGovSeal(58);

/* 2. 산하 기관 렌더링 */
function renderAgencies() {
  const container = $('agList');
  container.innerHTML = AGENCIES.map((a, i) => {
    const blocked = isBlocked(a.name);
    const cardCls = 'agency-gov-card' + (blocked ? ' agency-blocked' : '');
    const statusBadge = blocked
      ? `<span class="agency-blocked-badge">⛔ 접근 차단</span>`
      : `<span class="agency-badge-status ${a.open ? 'active' : 'prep'}">${a.open ? '● 정상 운영' : '○ 개청 준비중'}</span>`;
    let btnHtml;
    if (blocked) {
      btnHtml = `<button type="button" class="agency-btn blocked" onclick="showBlockedNotice('${esc(a.name)}')">⛔ 접근 차단됨</button>`;
    } else if (a.url) {
      btnHtml = `<a class="agency-btn" href="${esc(a.url)}" target="_blank" rel="noopener">
          누리집 바로가기
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>`;
    } else {
      btnHtml = `<span class="agency-btn disabled">개청 준비중</span>`;
    }
    return `
      <div class="${cardCls}">
        <div class="agency-card-header">
          <span class="agency-no-code">${a.code}</span>
          ${statusBadge}
        </div>
        <h3>${esc(a.name)}</h3>
        <div class="agency-en">${esc(a.en)}</div>
        <p class="agency-desc">${esc(a.desc)}</p>
        <div class="agency-btn-row">
          <span style="font-size:0.75rem;color:#64748b;">${blocked ? '⚠ 누리집 접근 차단 중' : (a.open ? '온라인 서비스 가동중' : '시스템 개발 중')}</span>
          ${btnHtml}
        </div>
      </div>
    `;
  }).join('');
}
renderAgencies();

/* 3. 고시·공고 렌더링 및 필터링 */
let currentNoticeFilter = 'all';
function renderNotices(filter = currentNoticeFilter) {
  currentNoticeFilter = filter;
  const q = ($('ntSearch').value || '').trim().toLowerCase();
  const dir = $('ntSort').value === 'old' ? 1 : -1;
  const list = NOTICES
    .filter(n => (filter === 'all' || n.category === filter) &&
      (!q || (n.no + n.title + n.body + n.dept).toLowerCase().includes(q)))
    .sort((a, b) => dir * (a.date + a.no).localeCompare(b.date + b.no));
  $('ntCount').textContent = `총 ${list.length}건`;
  const listEl = $('ntList');
  if (list.length === 0) {
    listEl.innerHTML = '<div style="padding:30px;text-align:center;color:#64748b;">조건에 맞는 공고가 없습니다.</div>';
    return;
  }
  listEl.innerHTML = list.map(n => {
    const id = NOTICES.indexOf(n);
    return `
      <div class="notice-item-row">
        <button type="button" class="notice-item-top" aria-expanded="false" aria-controls="nt-detail-${id}" onclick="toggleNoticeDetail(this)">
          <span class="notice-no-badge">${esc(n.no)}</span>
          <span class="notice-row-title">${esc(n.title)}</span>
          <span class="notice-date">${esc(n.date)}</span>
        </button>
        <div class="notice-detail-body" id="nt-detail-${id}">
          <div style="font-weight:700;color:#0f172a;margin-bottom:6px;">담당부서: ${esc(n.dept)} | 등록일자: ${esc(n.date)}</div>
          <p>${esc(n.body)}</p>
          <div class="official-stamp-line">
            <span>이음중앙관리국 공식 관보 게재</span>
            <button type="button" style="background:none;border:none;color:#1d4ed8;font-weight:700;cursor:pointer;" data-doc="${id}">공문서 전문 보기 ›</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
renderNotices();
$('ntSearch').addEventListener('input', () => renderNotices());
$('ntSort').addEventListener('change', () => renderNotices());

function toggleNoticeDetail(topEl) {
  const open = topEl.nextElementSibling.classList.toggle('open');
  topEl.setAttribute('aria-expanded', open);
}
function toggleAcc(btn) {
  const open = btn.nextElementSibling.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
}
function toggleLaw(btn) {
  const collapsed = btn.nextElementSibling.classList.toggle('collapsed');
  btn.setAttribute('aria-expanded', !collapsed);
}

function filterNoticeTab(tab, btn) {
  document.querySelectorAll('.board-tab').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
    b.tabIndex = -1;
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  btn.tabIndex = 0;
  $('ntList').setAttribute('aria-labelledby', btn.id);
  renderNotices(tab);
}
/* 탭 키보드 조작: ← → Home End */
document.querySelector('.board-tabs').addEventListener('keydown', e => {
  const tabs = [...document.querySelectorAll('.board-tab')];
  const i = tabs.indexOf(document.activeElement);
  if (i < 0) return;
  let n = null;
  if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
  else if (e.key === 'Home') n = 0;
  else if (e.key === 'End') n = tabs.length - 1;
  if (n === null) return;
  e.preventDefault();
  tabs[n].focus();
  tabs[n].click();
});

/* 4. 부서 직제 및 조직도 렌더링 */
function renderOrg() {
  $('orgDepts').innerHTML = DEPTS.map(d => {
    return `
      <div class="org-dept-card">
        <span style="font-size:0.6875rem;font-weight:700;color:#2563eb;background:#eff6ff;padding:1px 6px;border-radius:3px;">${d.code}</span>
        <h4 style="margin-top:6px;">${esc(d.n)}</h4>
        <p>${esc(d.d)}</p>
      </div>
    `;
  }).join('');

  $('orgAgenciesBox').innerHTML = '<span>산하 소속 기관:</span>' + AGENCIES.map(a => {
    return `<div class="org-agency-tag">${esc(a.name)}</div>`;
  }).join('');
}
renderOrg();

/* 5. 규정 렌더링 */
function renderRules() {
  $('ruleList').innerHTML = RULES.map((r, i) => {
    return `
      <div class="law-article-item">
        <button type="button" class="law-article-header" aria-expanded="true" onclick="toggleLaw(this)">
          <div>
            <span class="law-article-num">${esc(r[0])}</span>
            <span>(${esc(r[1])})</span>
          </div>
          <span style="font-size:0.75rem;color:#64748b;">전문</span>
        </button>
        <div class="law-article-content">
          ${esc(r[2])}
        </div>
      </div>
    `;
  }).join('');
}
renderRules();

/* 6. 연혁 렌더링 */
function renderHistory() {
  $('hist').innerHTML = HIST.map((h, i) => {
    const isLatest = (i === HIST.length - 1);
    return `
      <div class="gov-timeline-entry ${isLatest ? 'active' : ''}">
        <div class="timeline-date-badge">${esc(h[0])}</div>
        <div class="timeline-text">${esc(h[1])}</div>
      </div>
    `;
  }).join('');
}
renderHistory();

/* 7. 민원 FAQ 렌더링 */
function renderFAQ() {
  $('faqList').innerHTML = FAQ.map((f, i) => {
    return `
      <div class="faq-item">
        <button type="button" class="faq-question-btn" aria-expanded="false" onclick="toggleAcc(this)">
          <span><span class="faq-q-badge">Q${i+1}.</span> ${esc(f[0])}</span>
          <span style="font-size:0.75rem;color:#94a3b8;">▼</span>
        </button>
        <div class="faq-answer-box">
          <strong style="color:#0f172a;display:block;margin-bottom:4px;">공식 안내:</strong>
          ${esc(f[1])}
        </div>
      </div>
    `;
  }).join('');
}
renderFAQ();

/* 8. 궤도 도식 (SVG 애니메이션 네트워크) */
function drawOrbit(targetId, width, height, radius) {
  const el = $(targetId);
  if (!el) return;
  const C = width / 2;
  const R = radius;
  const N = AGENCIES.length;
  const pts = AGENCIES.map((a, i) => {
    const ang = (-90 + (i * 360 / N)) * Math.PI / 180;
    return { a, ang, x: C + R * Math.cos(ang), y: C + R * Math.sin(ang) };
  });

  /* 그리는 순서(뒤 → 앞): 궤도 원·연결선 → 중심 엠블럼 → 산하 기관 노드 */
  let s = `<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="4 6"/>`;

  pts.forEach(q => {
    s += `<line x1="${C}" y1="${C}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="#cbd5e1" stroke-width="1.5"/>`;
  });

  s += `
    <!-- 중심 이음중앙관리국 엠블럼 노드 (연결선 위에 그려 선이 가리지 않게 함) -->
    <circle cx="${C}" cy="${C}" r="44" fill="#ffffff" stroke="#003366" stroke-width="2.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.08))"/>
    <circle cx="${C}" cy="${C}" r="54" fill="none" stroke="#003366" stroke-width="1" opacity="0.2"/>
    <circle cx="${C - 9}" cy="${C}" r="11" fill="none" stroke="#003366" stroke-width="3"/>
    <circle cx="${C + 9}" cy="${C}" r="11" fill="none" stroke="#e52528" stroke-width="3"/>
    <text x="${C}" y="${C + 27}" text-anchor="middle" fill="#003366" font-size="8.5" font-weight="900" font-family="'Noto Sans KR', sans-serif">이음중앙관리국</text>
  `;

  pts.forEach(q => {
    const a = q.a, x = q.x, y = q.y;
    s += `
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16" fill="${a.open ? '#003366' : '#f8fafc'}" stroke="${a.open ? '#2563eb' : '#94a3b8'}" stroke-width="2.5"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${a.open ? '#60a5fa' : '#cbd5e1'}"/>
      <text x="${x.toFixed(1)}" y="${(y + (Math.sin(q.ang) < -0.4 ? -24 : 32)).toFixed(1)}" text-anchor="middle" fill="#0f172a" font-size="12" font-weight="700" font-family="'Noto Sans KR', sans-serif">
        ${esc(a.name)}
      </text>
    `;
  });

  el.innerHTML = s;
}
drawOrbit('orbit', 480, 480, 160);
drawOrbit('orbitMini', 240, 240, 75);

/* 9. 화면 확대/축소 기능 */
let currentZoom = 100;
$('btnZoomIn').addEventListener('click', () => {
  if (currentZoom < 140) {
    currentZoom += 10;
    updateZoom();
  }
});
$('btnZoomOut').addEventListener('click', () => {
  if (currentZoom > 90) {
    currentZoom -= 10;
    updateZoom();
  }
});
$('btnZoomReset').addEventListener('click', () => {
  currentZoom = 100;
  updateZoom();
});
function updateZoom() {
  document.documentElement.style.fontSize = (16 * currentZoom / 100) + 'px';
  $('zoomVal').textContent = currentZoom + '%';
  try { localStorage.setItem('ieumZoom', currentZoom); } catch (err) {}
}

/* 10. 공식 누리집 확인 안내 토글 */
$('btnToggleGovInfo').addEventListener('click', function() {
  const exp = $('govOfficialExp');
  const isShown = exp.classList.toggle('show');
  this.setAttribute('aria-expanded', isShown);
  this.textContent = isShown ? '공식 누리집 확인 닫기 ▲' : '공식 누리집 확인 방법 ▼';
});

/* 11. 통합검색 기능 (고시·규정·산하기관·부서·FAQ) */
function handleSearch(e) {
  e.preventDefault();
  const q = $('searchInput').value.trim();
  if (!q) {
    toast('검색어를 입력해 주십시오.');
    $('searchInput').focus();
    return;
  }
  quickFill(q);
}
function quickFill(keyword) {
  $('searchInput').value = keyword;
  const k = keyword.toLowerCase();
  const has = (...xs) => xs.some(x => String(x).toLowerCase().includes(k));
  const mN = NOTICES.map((n, i) => [n, i]).filter(([n]) => has(n.no, n.title, n.body, n.dept));
  const mR = RULES.filter(r => has(r[0], r[1], r[2]));
  const mA = AGENCIES.filter(a => has(a.name, a.en, a.desc));
  const mD = DEPTS.filter(d => has(d.n, d.code, d.d));
  const mF = FAQ.filter(f => has(f[0], f[1]));
  const total = mN.length + mR.length + mA.length + mD.length + mF.length;
  const sec = (title, items) => items.length
    ? `<div class="res-sec"><h4>${title}</h4><ul>${items.join('')}</ul></div>` : '';

  let html = `<div style="margin-bottom:8px;"><strong>'${esc(keyword)}'</strong> 검색 결과 (총 ${total}건)</div>`;
  html += sec('[관련 고시·공고]', mN.map(([n, i]) =>
    `<li><a href="#" data-doc="${i}"><strong>${esc(n.no)}</strong> ${esc(n.title)}</a><br><span style="font-size:0.7812rem;color:#555;">${esc(n.body)}</span></li>`));
  html += sec('[관련 설치 규정]', mR.map(r =>
    `<li><a href="#rules" onclick="closeModal()"><strong>${esc(r[0])} (${esc(r[1])})</strong></a>: ${esc(r[2])}</li>`));
  html += sec('[산하 기관]', mA.map(a =>
    `<li><a href="#agencies" onclick="closeModal()"><strong>${esc(a.name)}</strong></a> - ${esc(a.desc)}</li>`));
  html += sec('[부서·직제]', mD.map(d =>
    `<li><a href="#org" onclick="closeModal()"><strong>${esc(d.n)}</strong></a> - ${esc(d.d)}</li>`));
  html += sec('[자주 묻는 질문]', mF.map(f =>
    `<li><a href="#faq" onclick="closeModal()"><strong>${esc(f[0])}</strong></a></li>`));
  if (total === 0) {
    html += '<p style="color:#64748b;">해당하는 검색 결과가 없습니다. 다른 단어로 검색해 주십시오.</p>';
  }
  openCustomModal(`통합검색 결과: "${esc(keyword)}"`, html);
}

/* 12. 공문서 상세 모달 */
function openDocModal(no, title, body, dept, date) {
  const sealHtml = makeGovSeal(85);
  const content = `
    <div style="border:2px solid #003366;padding:26px;position:relative;background:#fff;font-family:'Noto Sans KR',sans-serif;">
      <div style="text-align:center;border-bottom:2px solid #003366;padding-bottom:14px;margin-bottom:20px;">
        <span style="font-size:0.75rem;letter-spacing:4px;color:#64748b;">이음 공식 공문서</span>
        <h2 style="font-family:'Noto Serif KR',serif;font-size:1.5rem;font-weight:900;color:#003366;margin:4px 0;">이음중앙관리국 공문서</h2>
        <span style="font-size:0.8125rem;color:#475569;">고시·공고 열람용 사본</span>
      </div>

      <div style="margin-bottom:16px;font-size:0.8125rem;line-height:1.8;color:#334155;">
        <div><strong>문서번호:</strong> ${esc(no)}</div>
        <div><strong>시행일자:</strong> ${esc(date)}</div>
        <div><strong>소관부서:</strong> 이음중앙관리국 ${esc(dept)}</div>
        <div><strong>수&nbsp; &nbsp; &nbsp; 신:</strong> 전 산하 위원회 및 이음 구성원</div>
      </div>

      <div style="border-top:1px solid #e2e8f0;padding:18px 0;margin:16px 0;">
        <h3 style="font-size:1.0625rem;font-weight:800;color:#0f172a;margin-bottom:12px;">제목: ${esc(title)}</h3>
        <p style="font-size:0.875rem;line-height:1.8;color:#1e293b;text-indent:1em;">${esc(body)}</p>
      </div>

      <div style="margin-top:34px;display:flex;justify-content:space-between;align-items:flex-end;">
        <div style="font-size:0.75rem;color:#64748b;">
          위 고시는 이음중앙관리국 설치 규정에 의거하여 정식 발효되었습니다.
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-family:'Noto Serif KR',serif;font-size:1.1875rem;font-weight:900;color:#003366;letter-spacing:3px;">이음중앙관리국장</span>
          ${sealHtml}
        </div>
      </div>
    </div>
  `;
  openCustomModal(`공문서 열람 - [${esc(no)}]`, content);
}

/* 13. 모의 전자민원 접수 처리 (접수 내역은 이 브라우저에만 저장) */
const CIVIL_KEY = 'ieumCivil';
const CIVIL_STATUS = ['접수 완료', '검토 중', '처리 완료', '반려'];
function loadCivil() {
  try {
    const v = JSON.parse(localStorage.getItem(CIVIL_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch (err) { return []; }
}
function saveCivil(list) {
  try { localStorage.setItem(CIVIL_KEY, JSON.stringify(list.slice(0, 500))); return true; }
  catch (err) { toast('저장 공간이 부족하거나 사용할 수 없습니다.'); return false; }
}
function civilStatusOf(c) { return CIVIL_STATUS.includes(c.status) ? c.status : '접수 완료'; }
function fmtTs(ts) {
  const d = new Date(ts);
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`;
}
function newReceiptNo(list) {
  let no;
  do { no = 'IEUM-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000); }
  while (list.some(c => c.no === no));
  return no;
}
function handleCivilSubmit(e) {
  e.preventDefault();
  const target = $('civilTarget').value;
  const title = $('civilTitle').value.trim();
  const content = $('civilContent').value.trim();
  if (!title || !content) { toast('제목과 내용을 입력해 주십시오.'); return; }

  const list = loadCivil();
  const receiptNo = newReceiptNo(list);
  const today = new Date().toISOString().split('T')[0];
  list.unshift({ no: receiptNo, date: today, ts: Date.now(), target, title, content, status: '접수 완료' });
  saveCivil(list);

  const th = 'text-align:left;padding:8px;background:#e2e8f0;';
  const html = `
    <div style="border:1.5px solid #003366;padding:24px;background:#f8fafc;border-radius:6px;">
      <div style="text-align:center;margin-bottom:18px;">
        <span style="background:#003366;color:#fff;padding:2px 8px;border-radius:3px;font-size:0.6875rem;font-weight:700;">전자민원 공식 접수증</span>
        <h3 style="font-size:1.25rem;font-weight:800;color:#003366;margin-top:6px;">민원이 정상적으로 접수되었습니다.</h3>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:0.8438rem;margin-bottom:16px;">
        <tr style="border-bottom:1px solid #cbd5e1;"><th style="${th}width:110px;">접수 번호</th><td style="padding:8px;font-weight:700;color:#1d4ed8;">${receiptNo}</td></tr>
        <tr style="border-bottom:1px solid #cbd5e1;"><th style="${th}">접수 일자</th><td style="padding:8px;">${today}</td></tr>
        <tr style="border-bottom:1px solid #cbd5e1;"><th style="${th}">대상 기관</th><td style="padding:8px;font-weight:700;">${esc(target)}</td></tr>
        <tr style="border-bottom:1px solid #cbd5e1;"><th style="${th}">민원 제목</th><td style="padding:8px;">${esc(title)}</td></tr>
        <tr><th style="${th}vertical-align:top;">민원 내용</th><td style="padding:8px;line-height:1.5;white-space:pre-wrap;word-break:break-word;">${esc(content)}</td></tr>
      </table>
      <p style="font-size:0.7812rem;color:#64748b;line-height:1.5;">
        * 접수된 민원은 해당 기관의 담당 주무관에게 배정되어 처리됩니다.<br>
        * 접수증은 가상 체험 기능으로 발급된 모의 증서이며, 접수 내역은 이 브라우저에만 저장됩니다.<br>
        * 접수한 민원은 &#39;내 접수 내역 조회&#39;에서 언제든지 삭제하실 수 있습니다.
      </p>
    </div>
    <div class="modal-actions">
      <button type="button" data-act="print">접수증 인쇄</button>
      <button type="button" data-act="lookup">내 접수 내역 조회</button>
    </div>
  `;

  openCustomModal('전자민원 신청 완료', html);
  $('civilForm').reset();
}

/* 내 접수 내역 조회·삭제 */
function openCivilLookup() {
  openCustomModal('내 접수 내역 조회', `
    <form id="civilLookupForm" style="display:flex;gap:8px;">
      <label class="sr-only" for="civilLookupNo">접수번호</label>
      <input id="civilLookupNo" class="form-input" placeholder="접수번호 일부 입력 (비우면 전체)" style="flex:1;">
      <button type="submit" style="padding:8px 16px;border-radius:6px;border:1px solid #003366;background:#003366;color:#fff;font-weight:700;">조회</button>
    </form>
    <div class="adm-note">이 브라우저에서 접수한 민원만 표시됩니다. 삭제하면 복구할 수 없습니다.</div>
    <div id="civilLookupResult"></div>`);
  renderCivilLookup('');
}
function renderCivilLookup(q) {
  const list = loadCivil().filter(c => !q || c.no.toLowerCase().includes(q.toLowerCase()));
  $('civilLookupResult').innerHTML = list.length
    ? list.map(c => `<div class="lookup-row"><b>${esc(c.no)}</b> · ${esc(c.date)} · ${esc(c.target)}<br>${esc(c.title)}<br>
        <span style="color:#64748b;">처리상태: </span><span class="status-chip">${esc(civilStatusOf(c))}</span>
        <details><summary>민원 내용 보기</summary><div class="lookup-body">${esc(c.content)}</div></details>
        <div class="row-actions"><button type="button" class="btn-danger" data-act="civil-del" data-no="${esc(c.no)}">삭제</button></div></div>`).join('')
    : '<p style="margin-top:14px;color:#64748b;">조회된 접수 내역이 없습니다.</p>';
}

/* 삭제 버튼: 한 번 누르면 "정말 삭제?"로 바뀌고, 3초 안에 다시 누르면 실행 */
function confirmTwice(btn, fn) {
  if (btn.classList.contains('armed')) { clearTimeout(btn._t); fn(); return; }
  const orig = btn.textContent;
  btn.classList.add('armed');
  btn.textContent = '정말 삭제?';
  btn._t = setTimeout(() => { btn.classList.remove('armed'); btn.textContent = orig; }, 3000);
}
function deleteCivil(no) {
  const list = loadCivil();
  const next = list.filter(c => c.no !== no);
  if (next.length === list.length) return false;
  saveCivil(next);
  return true;
}

/* 14. 모달 유틸리티 (포커스 관리·ESC·스크롤 잠금) */
let lastFocusEl = null;
function openCustomModal(title, bodyHtml) {
  const wasOpen = $('govModal').classList.contains('open');
  if (!wasOpen) lastFocusEl = document.activeElement;
  $('modalTitle').innerHTML = title;
  $('modalBody').innerHTML = bodyHtml;
  $('govModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  $('govModal').querySelector('.gov-modal-card').scrollTop = 0;
  $('govModal').querySelector('.modal-close-btn').focus({ preventScroll: true });
}
function closeModal() {
  if (!$('govModal').classList.contains('open')) return;
  $('govModal').classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocusEl && document.contains(lastFocusEl)) lastFocusEl.focus({ preventScroll: true });
  lastFocusEl = null;
}
function closeModalOnBg(e) {
  if (e.target.id === 'govModal') closeModal();
}
document.addEventListener('keydown', e => {
  if (!$('govModal').classList.contains('open')) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Tab') {
    const f = [...$('govModal').querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === $('govModal').querySelector('.gov-modal-card'))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
$('modalBody').addEventListener('click', e => {
  const d = e.target.closest('[data-doc]');
  if (d) {
    e.preventDefault();
    const n = NOTICES[Number(d.dataset.doc)];
    if (n) openDocModal(n.no, n.title, n.body, n.dept, n.date);
    return;
  }
  const act = e.target.closest('[data-act]');
  if (!act) return;
  if (act.dataset.act === 'print') {
    document.body.classList.add('print-modal');
    window.print();
    document.body.classList.remove('print-modal');
  } else if (act.dataset.act === 'lookup') {
    openCivilLookup();
  }
});
$('modalBody').addEventListener('submit', e => {
  if (e.target.id === 'civilLookupForm') {
    e.preventDefault();
    renderCivilLookup($('civilLookupNo').value.trim());
  }
});
$('btnCivilLookup').addEventListener('click', openCivilLookup);

/* 토스트 알림 (alert 대체) */
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* 15. 전체메뉴 버튼 클릭 */
$('btnAllMenu').addEventListener('click', () => {
  const menuHtml = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;font-size:0.875rem;">
      <div>
        <h4 style="color:#003366;font-size:1rem;border-bottom:2px solid #003366;padding-bottom:6px;margin-bottom:10px;">기관 소개</h4>
        <ul style="list-style:none;line-height:2.2;">
          <li><a href="#greet" onclick="closeModal()">국장 인사말</a></li>
          <li><a href="#about" onclick="closeModal()">설립 목적 및 체계</a></li>
          <li><a href="#history" onclick="closeModal()">기관 연혁</a></li>
          <li><a href="#org" onclick="closeModal()">직제 및 조직도</a></li>
        </ul>
      </div>
      <div>
        <h4 style="color:#003366;font-size:1rem;border-bottom:2px solid #003366;padding-bottom:6px;margin-bottom:10px;">산하 기관</h4>
        <ul style="list-style:none;line-height:2.2;">
          <li><a href="#agencies" onclick="closeModal()">중앙선물위원회</a></li>
          <li><a href="#agencies" onclick="closeModal()">가위바위보 심의위원회</a></li>
          <li><a href="#agencies" onclick="closeModal()">중앙시상위원회</a></li>
          <li><a href="#agencies" onclick="closeModal()">양심감사위원회</a></li>
          <li><a href="#network" onclick="closeModal()">통합 연계 도식</a></li>
        </ul>
      </div>
      <div>
        <h4 style="color:#003366;font-size:1rem;border-bottom:2px solid #003366;padding-bottom:6px;margin-bottom:10px;">법령 및 규정</h4>
        <ul style="list-style:none;line-height:2.2;">
          <li><a href="#rules" onclick="closeModal()">설치 및 운영 규정</a></li>
          <li><a href="#rules" onclick="closeModal()">독립성 보장 지침</a></li>
          <li><a href="#rules" onclick="closeModal()">신규기관 설치 규정</a></li>
        </ul>
      </div>
      <div>
        <h4 style="color:#003366;font-size:1rem;border-bottom:2px solid #003366;padding-bottom:6px;margin-bottom:10px;">소식 및 민원</h4>
        <ul style="list-style:none;line-height:2.2;">
          <li><a href="#notices" onclick="closeModal()">고시·공고 통합열람</a></li>
          <li><a href="#faq" onclick="closeModal()">전자민원 신청</a></li>
          <li><a href="#faq" onclick="closeModal()">자주 묻는 질문(FAQ)</a></li>
        </ul>
      </div>
    </div>
  `;
  openCustomModal('이음중앙관리국 전체메뉴', menuHtml);
});

/* 16. 관련 사이트 이동 */
function goToFamilySite() {
  const sel = $('familySelect');
  const url = sel.value;
  if (!url) {
    toast('이동하실 기관 누리집을 선택해 주십시오.');
    return;
  }
  if (url.startsWith('#')) {
    location.href = url;
  } else {
    window.open(url, '_blank');
  }
}

/* 17. 규정 전문 복사 */
function copyLawText() {
  const text = RULES.map(r => `${r[0]}(${r[1]}): ${r[2]}`).join('\n\n');
  navigator.clipboard.writeText(text).then(() => {
    toast('설치 및 운영에 관한 규정 전문이 복사되었습니다.');
  }).catch(() => {
    toast('복사 권한이 제한되어 있습니다.');
  });
}

/* ===== v2.1.2 보강 ===== */
/* 18. 공문서 보기 버튼 이벤트 위임 (인라인 onclick 문자열 조립 제거) */
$('ntList').addEventListener('click', e => {
  const b = e.target.closest('[data-doc]');
  if (!b) return;
  const n = NOTICES[Number(b.dataset.doc)];
  if (n) openDocModal(n.no, n.title, n.body, n.dept, n.date);
});

/* 19. 현황판·티커·푸터 셀렉트를 데이터(AGENCIES, NOTICES)에서 생성 */
function syncPortalStatus() {
  const sorted = [...NOTICES].sort((a, b) => (b.date + b.no).localeCompare(a.date + a.no));
  const latest = sorted[0];
  $('stCount').textContent = AGENCIES.length;
  $('stOpen').textContent = AGENCIES.filter(a => a.open).length;
  $('stNotice').textContent = NOTICES.length;
  $('stat1').textContent = AGENCIES.length;
  $('stat3').textContent = RULES.length + '개조';
  if (latest) {
    $('widgetTodayDate').textContent = '기준일 ' + latest.date.replace(/-/g, '.');
    $('tickerDate').textContent = latest.date;
    $('tickerContent').innerHTML = `<a href="#notices">[${esc(latest.no)}] ${esc(latest.title)}</a>`;
  }
  const names = AGENCIES.filter(a => a.open).map(a => a.name);
  const txt = document.querySelector('.widget-orbit-txt');
  if (txt && names.length) {
    txt.innerHTML = `<strong>실시간 산하 기관 연계도</strong>${esc(names.join(', '))}가 정상 운영 중입니다.`;
  }
  const sel = $('familySelect');
  sel.innerHTML = '<option value="">산하·관련 누리집 선택</option>'
    + AGENCIES.map(a => `<option value="${a.url ? esc(a.url) : '#agencies'}">${esc(a.name)}${a.open ? '' : ' (준비중)'}</option>`).join('')
    + '<option value="#notices">이음 전자관보</option><option value="#rules">이음 규정열람센터</option>';
}
syncPortalStatus();

/* 20. 푸터 정책 안내 모달 */
const POLICIES = {
  privacy: ['개인정보처리방침', '본 누리집은 가상 행정 체계를 체험하기 위한 패러디 사이트로, 서버에 개인정보를 전송·저장하지 않습니다. 전자민원 입력 내용은 접수증 표시를 위해 이용자 본인의 브라우저(localStorage)에만 저장되며, 외부로 전송되지 않습니다. 저장된 내용은 \'내 접수 내역 조회\'에서 언제든지 삭제할 수 있고, 브라우저의 사이트 데이터를 지우면 함께 삭제됩니다.'],
  terms: ['이용약관', '본 누리집의 모든 기관·문서·직인·번호는 창작된 가상의 것으로 실제 법적 효력이 없습니다. 이용자는 이를 실제 공문서로 오인하게 할 목적으로 사용하여서는 아니 됩니다.'],
  copyright: ['저작권보호정책', '본 누리집의 디자인과 문구는 창작물입니다. 비영리·비상업 목적의 패러디 및 체험 용도에 한해 출처를 밝히고 이용할 수 있습니다.'],
  email: ['이메일무단수집거부', '본 누리집에 게시된 이메일 주소를 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집하는 행위를 거부합니다.'],
  a11y: ['웹접근성정책', '본 누리집은 본문 바로가기, 글자 크기 조절, 키보드 이동을 제공하기 위해 노력합니다. 불편한 점은 전자민원(민원·참여)을 통해 알려 주십시오.'],
  location: ['찾아오시는 길', '(가상 08204) 이음시 중앙구 이음대로 100 이음종합청사 본관 7층 · 대표전화 02-1234-5678 · 통합 민원안내 1588-2026. 실제로 존재하지 않는 가상의 주소입니다.']
};
document.querySelector('.footer-policy-links').addEventListener('click', e => {
  const a = e.target.closest('[data-policy]');
  if (!a) return;
  e.preventDefault();
  const p = POLICIES[a.dataset.policy];
  openCustomModal(esc(p[0]), `<p style="line-height:1.8;font-size:0.875rem;">${esc(p[1])}</p>`);
});

/* 21. 글자 크기 설정 저장 */
try {
  const saved = parseInt(localStorage.getItem('ieumZoom'), 10);
  if (saved >= 90 && saved <= 140) { currentZoom = saved; updateZoom(); }
} catch (err) {}

/* ===== v2.2.0 보강 ===== */
/* 22. 우측 산하기관 배너를 AGENCIES에서 생성 */
function renderBanners() {
  const cls = ['bg-gift', 'bg-rps', 'bg-award', 'bg-conscience'];
  $('bannerZone').innerHTML = AGENCIES.map((a, i) => {
    const blocked = isBlocked(a.name);
    const inner = `
      <div>
        <span class="b-tag">${blocked ? '⛔ 접근 차단' : (a.open ? '산하 정식 기관' : '산하 신설 기관 · 준비중')}</span>
        <h4>${esc(a.name)}</h4>
        <p>${esc(a.desc)}</p>
      </div>
      <span class="b-link">${blocked ? '접근 차단됨' : (a.open ? '공식 누리집 방문 ›' : '개청 준비중')}</span>`;
    const c = 'banner-card ' + (cls[i] || 'bg-award') + (blocked ? ' banner-blocked' : '');
    if (blocked) {
      return `<div class="${c}" onclick="showBlockedNotice('${esc(a.name)}')" style="cursor:pointer;">${inner}</div>`;
    }
    return a.open && a.url
      ? `<a href="${esc(a.url)}" target="_blank" rel="noopener" class="${c}">${inner}</a>`
      : `<div class="${c}">${inner}</div>`;
  }).join('');
}
renderBanners();

/* 23. 상단 메뉴 현재 위치 표시 (스크롤 스파이) */
const SPY_IDS = ['greet', 'about', 'agencies', 'org', 'rules', 'notices', 'history', 'faq'];
let spyTick = false;
function updateSpy() {
  spyTick = false;
  let cur = null;
  SPY_IDS.forEach(id => {
    const el = $(id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top <= 160 && r.bottom > 160) cur = id;
  });
  document.querySelectorAll('.gnb-nav > li').forEach(li => {
    const a = li.firstElementChild;
    const on = a.getAttribute('href') === '#' + cur;
    li.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', () => {
  if (!spyTick) { spyTick = true; requestAnimationFrame(updateSpy); }
}, { passive: true });
updateSpy();

/* ===== 민원 삭제 이벤트 ===== */
$('modalBody').addEventListener('click', e => {
  const act = e.target.closest('[data-act="civil-del"]');
  if (!act) return;
  confirmTwice(act, () => {
    if (deleteCivil(act.dataset.no)) { toast('민원이 삭제되었습니다.'); renderCivilLookup(($('civilLookupNo').value || '').trim()); }
  });
});

/* ===== 관리자 접근 차단·민원 관리 (이 브라우저에 저장되는 체험 기능) ===== */
const isAdmin = () => sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
function readAdminStore(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
  catch (err) { return fallback; }
}
function blockedAgencies() { return readAdminStore(ADMIN_BLOCK_KEY, {}); }
function isBlocked(name) { return Boolean(blockedAgencies()[name]?.blocked); }
function showBlockedNotice(name) {
  const a = AGENCIES.find(x => x.name === name);
  const record = blockedAgencies()[name] || {};
  const reason = record.reason || '관리국의 운영 방침에 따라 해당 누리집의 접근이 일시적으로 제한되었습니다.';
  const html = `<article class="block-notice-card"><header class="block-notice-header"><span class="block-notice-badge">접근 제한 안내</span><h3 class="block-notice-title">누리집 접근이 차단되었습니다</h3><div class="block-notice-sub">이음중앙관리국 통합 누리집 관리 시스템</div></header><div class="block-notice-body"><p>요청하신 산하 기관 누리집은 현재 관리국의 조치로 접근이 제한되어 있습니다.</p><table><tr><th>대상 기관</th><td>${esc(name)}</td></tr><tr><th>차단 사유</th><td>${esc(reason)}</td></tr><tr><th>조치 상태</th><td>접근 제한 중</td></tr></table><p style="margin-top:14px">자세한 사항은 이음중앙관리국 전자민원 창구를 이용해 주시기 바랍니다.</p></div><footer class="block-notice-footer"><span class="note">본 안내는 가상 누리집의 체험용 안내입니다.</span><span class="sign">이음중앙관리국장</span></footer></article>`;
  openCustomModal('공식 누리집 접근 차단 안내', html);
}
function showAdminLoginModal() {
  if (isAdmin()) { showAdminPanel(); return; }
  openCustomModal('관리자 로그인', `<form id="adminLoginForm" class="admin-login-form"><label for="adminPassword">관리자 비밀번호</label><input id="adminPassword" type="password" autocomplete="current-password" required><button class="admin-login-submit" type="submit">로그인</button><div id="adminLoginError" class="admin-login-error" role="alert">비밀번호가 올바르지 않습니다.</div><p class="adm-note">로그인 상태는 이 브라우저 탭의 세션 동안 유지됩니다.</p></form>`);
  $('adminPassword').focus();
}
function syncAdminUi() {
  const logged = isAdmin();
  $('adminBadge').style.display = logged ? '' : 'none';
  const btn = $('btnAdminLogin');
  btn.textContent = logged ? '⚙ 관리자 패널' : '관리자';
  btn.classList.toggle('logged-in', logged);
  renderAgencies();
  renderBanners();
}
function addAdminLog(action, name, reason = '') {
  const list = readAdminStore(ADMIN_LOG_KEY, []);
  list.unshift({ ts: Date.now(), action, name, reason });
  try { localStorage.setItem(ADMIN_LOG_KEY, JSON.stringify(list.slice(0, 100))); } catch (err) {}
}
function showAdminPanel() {
  if (!isAdmin()) return showAdminLoginModal();
  const blocks = blockedAgencies();
  const rows = AGENCIES.map((a, i) => {
    const b = blocks[a.name] || {};
    return `<div class="admin-agency-row ${b.blocked ? 'is-blocked' : ''}"><div><div class="admin-agency-name">${esc(a.name)}</div><div class="admin-agency-code">${esc(a.code)} · ${b.blocked ? '차단 중' : '정상'}</div></div><input class="admin-reason-input" data-reason="${i}" aria-label="${esc(a.name)} 차단 사유" placeholder="차단 사유 (선택)" value="${esc(b.reason || '')}"><label class="toggle-switch"><input type="checkbox" data-block="${i}" ${b.blocked ? 'checked' : ''} aria-label="${esc(a.name)} 접근 차단"><span class="toggle-track blocked-mode"></span><span class="toggle-label">차단</span></label></div>`;
  }).join('');
  const logs = readAdminStore(ADMIN_LOG_KEY, []);
  const logHtml = logs.length ? `<div style="overflow-x:auto"><table class="admin-log-table"><thead><tr><th>시각</th><th>조치</th><th>기관</th><th>사유</th></tr></thead><tbody>${logs.slice(0,30).map(x => `<tr><td>${esc(fmtTs(x.ts))}</td><td class="${x.action === '차단' ? 'log-action-block' : 'log-action-unblock'}">${esc(x.action)}</td><td>${esc(x.name)}</td><td>${esc(x.reason || '-')}</td></tr>`).join('')}</tbody></table></div>` : '<div class="admin-log-empty">기록된 관리 로그가 없습니다.</div>';
  const civils = loadCivil();
  const civilHtml = civils.length ? `<button type="button" class="admin-civil-bulk-del" data-admin-act="delete-all-civil">민원 전체 삭제</button>${civils.map(c => `<article class="admin-civil-item"><b>${esc(c.no)}</b> · ${esc(c.date)} · ${esc(c.target)}<br><strong>${esc(c.title)}</strong><p>${esc(c.content)}</p><label>처리 상태 <select data-civil-status="${esc(c.no)}">${CIVIL_STATUS.map(s => `<option ${civilStatusOf(c) === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label><div class="admin-civil-actions"><button type="button" class="btn-danger" data-admin-act="delete-civil" data-no="${esc(c.no)}">삭제</button></div></article>`).join('')}` : '<div class="admin-log-empty">접수된 민원이 없습니다.</div>';
  openCustomModal('관리자 패널', `<div class="admin-panel-warning">⚠ 설정과 로그, 민원은 이 브라우저에만 저장됩니다. 비밀번호는 SHA-256 해시로 비교하지만, 정적 사이트만으로는 서버 수준의 인증을 제공할 수 없습니다.</div><section class="admin-panel-section"><h4>🏛️ 산하 기관 접근 차단</h4><div class="admin-bulk-btns"><button type="button" class="admin-bulk-btn block-all" data-admin-act="block-all">전체 차단</button><button type="button" class="admin-bulk-btn unblock-all" data-admin-act="unblock-all">전체 해제</button></div><div id="adminAgencyRows">${rows}</div></section><section class="admin-panel-section"><h4>📋 전자민원 관리 (${civils.length}건)</h4><div id="adminCivils">${civilHtml}</div></section><section class="admin-panel-section"><h4>🧾 관리자 조치 로그</h4>${logHtml}</section><button type="button" class="admin-logout-btn" data-admin-act="logout">로그아웃</button>`);
}
$('modalBody').addEventListener('submit', e => {
  if (e.target.id !== 'adminLoginForm') return;
  e.preventDefault();
  const form = e.target;
  crypto.subtle.digest('SHA-256', new TextEncoder().encode($('adminPassword').value))
    .then(hash => {
      const hex = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
      if (hex === ADMIN_PASSWORD_SHA256) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, '1'); syncAdminUi(); showAdminPanel();
      } else { $('adminLoginError').classList.add('show'); $('adminPassword').select(); }
    })
    .catch(() => { const error = $('adminLoginError'); error.textContent = '이 브라우저에서는 암호화 기능을 사용할 수 없습니다.'; error.classList.add('show'); });
});
$('modalBody').addEventListener('change', e => {
  if (e.target.matches('[data-block]')) {
    if (!isAdmin()) return;
    const i = Number(e.target.dataset.block), a = AGENCIES[i];
    const blocks = blockedAgencies(), blocked = e.target.checked;
    const reason = $('modalBody').querySelector(`[data-reason="${i}"]`).value.trim();
    blocks[a.name] = { blocked, reason };
    localStorage.setItem(ADMIN_BLOCK_KEY, JSON.stringify(blocks));
    addAdminLog(blocked ? '차단' : '해제', a.name, reason);
    syncAdminUi(); showAdminPanel();
  } else if (e.target.matches('[data-civil-status]')) {
    const list = loadCivil(), c = list.find(x => x.no === e.target.dataset.civilStatus);
    if (c) { c.status = e.target.value; saveCivil(list); toast('민원 처리 상태가 변경되었습니다.'); }
  }
});
$('modalBody').addEventListener('click', e => {
  const b = e.target.closest('[data-admin-act]'); if (!b || !isAdmin()) return;
  const act = b.dataset.adminAct;
  if (act === 'logout') { sessionStorage.removeItem(ADMIN_SESSION_KEY); syncAdminUi(); closeModal(); toast('로그아웃되었습니다.'); }
  else if (act === 'block-all' || act === 'unblock-all') {
    const blocked = act === 'block-all', blocks = blockedAgencies();
    AGENCIES.forEach(a => { blocks[a.name] = { ...(blocks[a.name] || {}), blocked }; addAdminLog(blocked ? '차단' : '해제', a.name, blocks[a.name].reason || '일괄 처리'); });
    localStorage.setItem(ADMIN_BLOCK_KEY, JSON.stringify(blocks)); syncAdminUi(); showAdminPanel();
  } else if (act === 'delete-civil') {
    confirmTwice(b, () => { deleteCivil(b.dataset.no); showAdminPanel(); });
  } else if (act === 'delete-all-civil') {
    confirmTwice(b, () => { saveCivil([]); showAdminPanel(); });
  }
});
syncAdminUi();
