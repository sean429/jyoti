import LegalPage, { LegalSection } from '@/components/LegalPage';

export const metadata = { title: '개인정보처리방침 — Jyoti' };

const CONTACT = 'jyotivedic2026@gmail.com';

export default function PrivacyPage() {
  return (
    <LegalPage title="개인정보처리방침" updated="2026년 7월 24일">
      <p className="mb-8">
        Jyoti(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 소중히 다루며, 개인정보 보호법 등 관련 법령을 준수합니다.
        이 방침은 서비스가 어떤 정보를 왜 수집하고, 어디로 보내며, 언제 지우는지를 설명합니다.
      </p>

      <LegalSection heading="1. 수집하는 정보와 이용 목적">
        <p className="mb-3">
          <strong style={{ color: 'var(--gold-light)' }}>차트 해석 이용 시</strong> — 이름(선택), 생년월일, 출생 시각(선택), 출생지, 시간대.
          베딕 차트 계산과 AI 해석 생성에만 사용됩니다. 이 출생 정보는 서버에 저장하지 않으며,
          해석 생성이 끝나면 서버에는 남지 않습니다(생성된 해석은 이용자의 브라우저에만 임시 보관됩니다).
        </p>
        <p className="mb-3">
          <strong style={{ color: 'var(--gold-light)' }}>결제 확인 시</strong> — 결제에 사용한 전화번호 또는 이메일, 주문번호.
          구매 내역 확인, 이용권 충전·차감, 친구 초대 보상 지급에 사용됩니다.
        </p>
        <p>
          <strong style={{ color: 'var(--gold-light)' }}>자동 수집</strong> — 접속 IP 주소(과도한 요청 차단 목적, 최대 1분 보관),
          개인을 식별할 수 없는 익명 이용 통계(일일 이용 횟수 등).
        </p>
      </LegalSection>

      <LegalSection heading="2. 처리 위탁 및 국외 이전">
        <p className="mb-3">
          AI 해석 생성을 위해 입력하신 이름·출생 정보와 차트 데이터가 아래 외부 사업자에게 전송됩니다.
          전송된 정보는 해석 생성에만 사용됩니다.
        </p>
        <p className="mb-2">· Google LLC (미국) — 무료 종합 해석 생성 (Gemini API)</p>
        <p className="mb-2">· DeepSeek — 杭州深度求索人工智能基础技术研究有限公司 (중국) — 유료 심층 해석 생성</p>
        <p className="mb-2">· Upstash, Inc. (미국) — 구매 기록 저장</p>
        <p className="mb-2">· Vercel Inc. (미국) — 서비스 호스팅</p>
        <p className="mb-3">· 그로블(Groble) — 결제 처리. 카드·간편결제 정보는 그로블이 자체 수집·처리하며, 서비스는 결제 완료 확인 정보(주문번호·전화번호·이메일)만 수신합니다.</p>
        <p>국외 이전을 원치 않으시는 경우 유료 해석 이용을 중단하시면 되며, 이 경우 출생 정보가 중국 소재 사업자에게 전송되지 않습니다.</p>
      </LegalSection>

      <LegalSection heading="3. 보유 기간">
        <p className="mb-2">· 출생 정보: 서버에 저장하지 않음 (해석 생성 시에만 처리)</p>
        <p className="mb-2">· 구매 기록(전화번호·이메일·주문번호·이용권 내역): 마지막 갱신일로부터 1년 후 자동 파기</p>
        <p className="mb-2">· IP 기반 요청 카운터: 최대 1분</p>
        <p>· 익명 통계: 개인 식별 정보를 포함하지 않으므로 계속 보관될 수 있음</p>
      </LegalSection>

      <LegalSection heading="4. 이용자의 권리">
        <p>
          이용자는 언제든지 자신의 구매 기록에 대한 열람·정정·삭제를 요청할 수 있습니다.
          아래 문의처로 결제에 사용한 전화번호 또는 주문번호와 함께 요청해 주시면 지체 없이 처리합니다.
          단, 구매 기록을 삭제하면 남은 이용권과 열람 권한도 함께 사라집니다.
        </p>
      </LegalSection>

      <LegalSection heading="5. 만 14세 미만의 이용">
        <p>서비스는 만 14세 미만 아동의 개인정보를 수집하지 않으며, 만 14세 미만은 서비스를 이용할 수 없습니다.</p>
      </LegalSection>

      <LegalSection heading="6. 문의처 및 변경 고지">
        <p className="mb-2">개인정보 관련 문의: {CONTACT}</p>
        <p>이 방침이 변경되는 경우 이 페이지를 통해 공지하며, 중요한 변경은 시행 7일 전에 게시합니다.</p>
      </LegalSection>
    </LegalPage>
  );
}
