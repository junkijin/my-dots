---
name: humanize-korean
description: Use when removing AI tells and translationese from AI-written Korean text to make it read like human writing. Applies even when the user does not mention AI and only asks to make the text sound human. Not for general editing, spelling correction, translation, summarization, or non-Korean text.
---

# Humanize Korean — AI 한글 티 제거

한글 텍스트의 "AI 티"를 한 번에 탐지·윤문·자체검증한다. 룰북에 근거하지 않은 구간은 절대 건드리지 않는다.

## 철칙 (위반 시 즉시 롤백)

1. **의미 불변**: 사실·주장·수치·날짜·고유명사·인용문은 원문과 100% 일치.
2. **근거 기반**: `references/quick-rules.md`에 매핑되지 않는 구간은 건드리지 않는다.
3. **장르 유지**: 입력 장르(칼럼·리포트·블로그·공적)에서 이탈 금지.
4. **register 보존**: 원문 격식체면 결과도 격식체. AI 티는 문법·수사이지 격식 자체가 아니다.
5. **과윤문 금지**: 변경률 30% 초과 = 경고, 50% 초과 = 작업 중단·롤백.
6. **Do-NOT**: 고유명사·수치·인용·법조문·영어 약어(LLM·GPU·API 등) 원형 보존. 원문에 없던 비유·수사·예시 추가 금지.

## 절차

1. **룰북 로드**: 이 스킬 디렉토리의 `references/quick-rules.md`를 읽어 S1·S2 패턴 표와 자체검증 체크리스트를 내재화한다.
2. **입력 확보**: 사용자가 붙여넣은 텍스트가 원문. 파일 경로(.txt/.md)를 주면 그 파일을 읽는다. 한국어가 아니면 "한국어 텍스트만 처리 가능" 안내 후 종료.
3. **장르 추정**: 첫 300자로 칼럼·리포트·블로그·공적 중 추정(사용자 명시 시 우선).
4. **탐지**: A~J 카테고리 패턴을 스캔해 (ID, span, severity, fix)를 수집. Do-NOT span은 제외. 문서 레벨 패턴(문장 길이 stdev, 종결어미 반복, 헤딩·불릿 구조)도 포함.
5. **윤문**: D(관용구 삭제) → A → I → G → H → F → B → C·J → E 순서로 문단 단위 처리. 탐지 finding에 연결되지 않는 수정은 하지 않는다. 변경률을 모니터링하며 50% 임박 시 후속 edit 보류.
6. **자체검증**: quick-rules의 "자체검증 체크리스트" 6항 점검. 위반 시 해당 edit 롤백 → 부분 재윤문(최대 1회).
7. **출력**:
   - 입력이 파일이면 같은 디렉토리에 `{원본이름}.humanized.md`로 저장. 붙여넣기 텍스트면 윤문본을 응답에 직접 출력.
   - 윤문본과 별도로 요약을 덧붙인다: 변경률·등급·자체검증 통과 수 한 줄, 카테고리별 탐지 건수(before → after), 변경 하이라이트 3~5건(before → after, 각 100자 이내), 잔존 finding(있으면 ID·사유).

## 심각도·등급

- **S1**: 한 번만 나와도 AI로 확신되는 패턴 — 무조건 제거. **S2**: 3회+ 반복 시 제거. **S3**: 중첩 시에만 문제.
- **A**: S1 0건, S2 2건 이하, 변경률 10~25%, 자체검증 6/6.
- **B**: S1 0건, S2 4건 이하, 자체검증 5/6 이상.
- **C/D**: S1 잔존 또는 과윤문 시그널 — 사람 검토를 권고하고 문제 구간을 명시한다.

## 옵션 (요청에 자연어로)

`장르: 칼럼|리포트|블로그|공적` · `강도: 보수|기본|적극` · `최소심각도: S1|S2|S3`

## 참고 자료 (필요할 때만 로드)

- `references/quick-rules.md` — S1·S2 핵심 패턴 + 자체검증 체크리스트. **매 실행 필수.**
- `references/rewriting-playbook.md` — 카테고리별 치환 레시피. 처방이 애매하거나 강도 "적극"일 때 로드.
- `references/ai-tell-taxonomy.md` — 10대분류 × 40+ 패턴 전수(예문 포함, ~600줄). 특정 패턴의 판정 근거·예문이 필요할 때만 해당 섹션을 로드.
