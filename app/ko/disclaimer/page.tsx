import LegalPage, { LegalSection } from '@/components/LegalPage';

export const metadata = { title: '이용 안내 및 면책 고지 — Jyoti' };

export default function DisclaimerPage() {
  return (
    <LegalPage title="이용 안내 및 면책 고지" updated="2026년 7월 24일">
      <p className="mb-8">
        Jyoti의 모든 해석은 인도 베딕 점성술의 전통적 해석 체계와 AI(대규모 언어 모델)를 결합하여
        생성한 <strong style={{ color: 'var(--gold-light)' }}>오락 및 자기 이해 목적의 참고 자료</strong>입니다.
        이용 전에 아래 내용을 확인해 주세요.
      </p>

      <LegalSection heading="1. 전문적 조언이 아닙니다">
        <p className="mb-3">
          해석 내용은 의료·법률·재무·투자에 관한 전문적 조언이 아니며, 그 대체가 될 수 없습니다.
          건강 관련 내용은 일반적인 생활 습관 조언 수준이며, 몸의 이상 신호는 반드시 의료 기관에서
          진료받으시기 바랍니다. 중요한 결정은 해당 분야 전문가와 상의하세요.
        </p>
      </LegalSection>

      <LegalSection heading="2. AI 생성 콘텐츠의 한계">
        <p className="mb-3">
          해석은 AI가 실시간으로 생성하며, 사실과 다르거나 회차에 따라 표현이 달라지는 내용이
          포함될 수 있습니다. 같은 차트라도 생성할 때마다 문장과 강조점이 다를 수 있습니다.
        </p>
        <p>
          또한 베딕 점성술 자체가 검증된 과학이 아닌 전통적 상징 체계이므로,
          해석은 &ldquo;경향&rdquo;의 언어로 쓰이며 미래를 확정하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection heading="3. 입력 정보의 정확도">
        <p>
          베딕 차트는 출생 시각에 민감합니다. 출생 시각이 부정확하거나 입력하지 않은 경우(정오 기준으로 계산)
          라그나 등 주요 요소가 실제와 달라질 수 있으며, 해석의 정확도도 그만큼 낮아집니다.
        </p>
      </LegalSection>

      <LegalSection heading="4. 책임의 한계">
        <p>
          해석 내용을 근거로 한 판단과 행동의 책임은 이용자 본인에게 있습니다.
          서비스는 해석의 완전성·정확성을 보증하지 않으며, 해석 내용으로 인해 발생한
          직접·간접 손해에 대해 법령이 허용하는 범위 내에서 책임을 지지 않습니다.
        </p>
      </LegalSection>

      <LegalSection heading="5. 콘텐츠의 이용">
        <p>
          구매하신 해석·리포트는 구매자 본인의 개인적 이용을 위한 것입니다.
          해석 전문을 상업적으로 재판매하거나 서비스명을 제거하고 재배포하는 것은 허용되지 않습니다.
          개인 SNS 공유 기능을 통한 공유는 환영합니다.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
