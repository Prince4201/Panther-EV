// Content for /company. Phase 4 moves this into the database so Admin can edit it and upload the image shown inside the P.
export const companyContent = {
  title: 'Driving the future of electric mobility',
  intro: 'Panther builds heavy-duty passenger and cargo e-rickshaws for Indian roads and real-world business.',
  story: 'Panther was established in 2014 with its first e-rickshaw, pioneering clean mobility. In 2018 production expanded to include heavy-duty cargo vehicles, and in 2022 Panther introduced advanced Li-Ion battery technology for longer life cycles. Today more than 80,000 Panther vehicles are on Indian roads.',
  pShape: { enabled: true, image: '/brand/panther-p.png', imageAlt: 'A Panther e-rickshaw shown inside the Panther P mark' },
  // Editable placeholders. Wording is drawn from what Panther already publishes (clean mobility, Indian roads, reliability).
  // Replace with Panther's approved Vision and Mission text.
  vision: { title: 'Clean mobility for every Indian road', body: 'To be the most trusted name in electric rickshaws, pioneering clean mobility that works as hard as the people who drive it.' },
  mission: {
    title: 'Dependable vehicles, built for business',
    points: [
      { title: 'Build', body: 'Heavy-duty passenger and cargo e-rickshaws designed for the toughest Indian roads.' },
      { title: 'Support', body: 'Low-maintenance vehicles that keep owners and operators earning for longer.' },
      { title: 'Innovate', body: 'Advanced Li-Ion battery technology for longer life cycles and efficient range.' },
    ],
  },
  values: [
    { title: 'Reliability first', body: '10+ years of trusted performance and durability in the toughest Indian environments.' },
    { title: 'Low maintenance', body: 'Designed to minimise service needs and costs, so vehicles spend more time earning.' },
    { title: 'Built for business', body: 'Efficiency tuned for maximum range and profitability for owners and operators.' },
  ],
};
