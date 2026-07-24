import LegalPage, { LegalSection } from '@/components/LegalPage';

export const metadata = { title: '취소·환불 안내 — Jyoti' };

const CONTACT = 'jyotivedic2026@gmail.com';

export default function RefundPage() {
  return (
    <LegalPage title="취소·환불 안내" updated="2026년 7월 24일">
      <p className="mb-8">
        Jyoti의 유료 상품(이용권, 심층 해석, PDF 리포트)은 그로블(Groble)을 통해 결제되며,
        환불도 결제하신 수단(카카오페이·네이버페이 등)으로 진행됩니다.
      </p>

      <LegalSection heading="1. 열람 전 환불">
        <p>
          구매하신 이용권을 사용하지 않았고 해석을 열람하지 않으셨다면,
          결제일로부터 7일 이내에 전액 환불을 요청하실 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection heading="2. 일부 사용 후 환불">
        <p>
          여러 장의 이용권 중 일부만 사용하신 경우, 사용한 만큼을 판매 단가 기준으로 차감한
          나머지 금액을 환불해 드립니다.
        </p>
      </LegalSection>

      <LegalSection heading="3. 열람 후 환불 제한">
        <p className="mb-3">
          해석·리포트는 디지털 콘텐츠로, 열람과 동시에 제공이 완료됩니다.
          전자상거래 등에서의 소비자보호에 관한 법률 제17조 제2항에 따라,
          제공이 개시된 디지털 콘텐츠는 청약철회(환불)가 제한됩니다. 이 점을 결제 전에 확인해 주세요.
        </p>
        <p>
          다만 해석 생성 실패, 내용 누락·깨짐 등 서비스 하자가 있는 경우에는
          열람 여부와 관계없이 재생성 또는 환불로 처리해 드립니다.
        </p>
      </LegalSection>

      <LegalSection heading="4. 이용권과 열람 기간">
        <p className="mb-2">· 이용권과 구매 기록은 결제일로부터 1년간 유효합니다.</p>
        <p className="mb-2">· 잠금 해제 후 열람 세션은 24시간 유지되며, 이후에도 결제하신 전화번호를 다시 입력하면 유효기간 내 언제든 다시 열 수 있습니다.</p>
        <p>· 열람한 해석은 차트 정보를 기준으로 생성되므로, 출생 정보를 바꾸어 다시 생성하는 경우 내용이 달라질 수 있습니다.</p>
      </LegalSection>

      <LegalSection heading="5. 환불 요청 방법">
        <p className="mb-2">
          아래 문의처로 <strong style={{ color: 'var(--gold-light)' }}>주문번호 또는 결제에 사용한 전화번호</strong>와
          환불 사유를 보내주세요. 접수 후 영업일 기준 3일 이내에 답변드리며,
          환불 승인 시 그로블을 통해 결제 수단으로 환급됩니다(결제 수단에 따라 3~7일 소요될 수 있습니다).
        </p>
        <p>문의처: {CONTACT}</p>
      </LegalSection>
    </LegalPage>
  );
}
