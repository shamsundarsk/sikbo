import React from 'react';

const IMG = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh48WHMFVFeA7KXJ95i2t-EWJyedcCo-_JdHJlARbeEvsBNa_CUXa_LTbMDXh4hYIEtRjlT-3xGYzdL-FlGMtYLn6Ao3BmV5KargkP1nIGIO3z95ia8p592xATKZHtiwXvVin1WooiQzL5mn9p4jwEnOmA7iqi0uO2q1nmKxmvPXf3Qm0OQesjJVB6WgCip1koVindNNHTmnfuDXDk0u2QB-HUrqBiAKLIn5zCHMuJwT4A3HBq5-x__YoHszh51gQdAVSLMcZPaQ',
  card1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBo0U0yrJzI4Ohjbg-n7K42FojeWL1iQ89DXhBtg1ZLjTOSfi1Slzf4-gdkdniEDtFAlFm_F1o0nptJc61J4_tCxat3ARwNVJzlmR7NyWGImDrAKuoiDBmqoByw5Y6M5lEv9bIb6CQFh_2KaiZzN9BNpl91jDZxmgBWgemngd_hlPUgJb4PmVxWHw7GPaP1_2eGqRDm2Q-cATNZ09Ng9iWKFdIOsVLbqgyAECt-QO4-vAHt15rZwlYKemtIfW7Q7gc8TJejgzj9Rg',
  card2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJBg8sBIiJ4tqtnKQJA2um9p6g8d5nxhwBoSt_sdd24kvXNtnCSnGw32L1ZDPvPx1GT6_emRwoFmhLtAYy3HV8fDK3vizclwXF4YnHVsk4CRM_O2RZ0bV_mpQAuI5CSW9tstpd3B1OsnXHa93CZTI1NSp-Mednz8GJGb9RsY8flWmHtxQ2rbKG1R7Aa58sK9zyVyw5xLbRQs3OxGdL24l3KyievO2kNGipgtZ2ryoRkf_v7teTB5iwCBmJVFOtP0K-AENrj-KtmQ',
  card3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZZ_7tsA-fGSwVuge4dQSPRLZMcaZ1HJO8zVk97G6wRqM-xcQ0WCa776PuMHuxjn3w_vsRMFjLY5M9UxXbnU5KFQZwb9n7HcRspXn4BgTXbHKOmOiSYok2zDumSmG6zoexMYEzoUvI_gC0T2g68C4CudST-O6v3CmOZwMIG6qJuwlnEPHG4lW9QBP3Gv-woJvMnAI9d_JbYnqa3xOcuCHU5dbqky7QrPdEc5_tYAlN3qmxG4lS0Zxj5sjeptUO-5QGA51XIxXLtA',
  staff: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIYWNpiv3z4Wq7tRz6jXb54TR0cYC5ZC-abmSWf7eRZxZORye1JJS4iUsIPe-Uwf6_YaQqrxA1vjjd_j-sCvq7pjnqgwEvT7R9wAp6G1U95lbqV0RmFVrXlTO37mhsRnj08Gr1hNJnCDfzTAqMVIwt6KcaBxI-93vGRbGAl9mvMIpMQEIgz-NZKG38PY1zD3WZ9TyZECk2GFwIm-EeMnDUBbVQ1fwFNuZvt150fwmGJkcZpXC3hYtUPPzQKioBQwZAltDWwQmvDg',
  trends: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFewTgod9dFB6RRQmiWwbvccfsHV7n_bdBy9jZ6AY87w3R5IXSO6SMWkwLjmsTS7dBwPUprFyQD_12jw5VJMG6npZBCZ2FZ_4UU3rIry7Ht72FSTkibdDEZTb7afFJUZYvateuWW61mmLi3M7_SF4ZUHwL-cK6MPijBgHSqWpiaYSqrwU-6K7XWsOKLLv75pgTIbfbPV2JFz19V9EP9oEoe--qrCqRQKRjQqgkurQ3AZg9K5ZcSCwr7PYyzdl0AS0frZqaqK8_DA',
  ingredients: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB3ALmuT-ksQgXtRJpTByhSs9DiIx3XWwfHLcKVdh_YNQ1CsY2CHq8wUdh_zKws_aMnshI74VwMaL0T4crcdZtylZR3jmDuaXmUXXpQAPvQK9hkfJTjcyYt3PyrOxg66YhX-0sjWTNGyu7Er5zK90SGjAAkl81Dk8CSO8kMwDlJFMk7113x_JM1OjfUBLfWvnXBtMOuiaANfHYiV9ax7r8zZUGaOraNPUticdD7enIJKSC8Y5u_Be3dkL6h_cEpTv39xEQ_3cl7Q',
  chef: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPrFyl9eJ1WP16OkSK_LaLCJJC7GTH14dFwUM_lyox7hQg5WDC3yGRNDPoR-yMjOB1uonnOVFBXhxxC-QBh_5vK0-qMzZYpnH7jvRraGzRzmf1MVabkQDdYRFPFS5Ze6hxOpknmDq44zGyeD15cLk116I57A_CovoMumRIi0Pt6UxG6p2lbetyQrvqGsylFznfxlvIc9cpPFEpRkJFiHkXFxnvKl7-B0tFSV16-zFbTSaNQb0GPbifEGEPnd-pqUexmR3gx9paSg',
};

const PREMIUM_GRADIENT = { background: 'linear-gradient(135deg, #5c5e66 0%, #50525a 100%)' };

function LandingPage({ onSignIn }) {
  return (
    <div className="bg-background text-on-surface font-body">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-extrabold tracking-tighter text-slate-900 font-headline">SCOOBY</div>
          <div className="hidden md:flex items-center gap-8">
            <span className="font-headline font-bold text-sm tracking-tight text-slate-900 border-b-2 border-slate-900 pb-1">Features</span>
            <span className="font-headline font-bold text-sm tracking-tight text-slate-500 hover:text-slate-800 transition-colors">Solutions</span>
            <span className="font-headline font-bold text-sm tracking-tight text-slate-500 hover:text-slate-800 transition-colors">Pricing</span>
          </div>
          <button onClick={onSignIn} style={PREMIUM_GRADIENT}
            className="px-6 py-2.5 text-on-primary font-headline font-bold text-sm rounded-xl active:scale-95 transition-all duration-200 shadow-sm">
            Get Started
          </button>
        </div>
      </nav>

      <main className="pt-24 overflow-x-hidden">

        {/* Hero */}
        <section className="relative px-6 py-16 md:py-28 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="max-w-4xl mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold tracking-[0.2em] uppercase bg-secondary-container text-on-secondary-container rounded-full">
              The Culinary Architect
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-8 leading-[1.1]">
              The Intelligence Your <br className="hidden md:block" />
              <span className="text-primary italic">Restaurant Deserves.</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              From kitchen efficiency to customer sentiment, SCOOBY turns raw data into actionable culinary insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={onSignIn} style={PREMIUM_GRADIENT}
                className="px-8 py-4 text-on-primary font-headline font-bold text-lg rounded-xl shadow-xl hover:-translate-y-0.5 transition-all">
                Get Started Free
              </button>
              <button className="px-8 py-4 bg-surface-container-highest text-on-surface font-headline font-bold text-lg rounded-xl hover:bg-surface-variant transition-all">
                Book a Demo
              </button>
            </div>
          </div>
          <div className="w-full max-w-6xl mx-auto relative mt-10">
            <div className="rounded-2xl overflow-hidden bg-surface-container-lowest p-2 ring-1 ring-outline-variant/10"
              style={{ boxShadow: '0 40px 100px rgba(43,52,55,0.12)' }}>
              <img src={IMG.hero} alt="SCOOBY dashboard" className="w-full rounded-xl" />
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 blur-3xl opacity-50" />
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 bg-surface-container-low/50">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold tracking-widest text-outline uppercase mb-10">Trusted by the World's Leading Kitchens</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 grayscale opacity-60">
              {['LUMIÈRE', 'SAVOR & CO', 'THE GARDEN', 'OAK + IRON', 'BISTRO V'].map(n => (
                <div key={n} className="text-xl font-headline font-extrabold tracking-tighter">{n}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-24 md:py-32 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">Precision Engineering for Modern Gastronomy.</h2>
              <p className="text-on-surface-variant text-lg">Stop guessing. Start orchestrating every detail of your operation with surgical precision.</p>
            </div>
            <div className="hidden md:block"><div className="w-24 h-1 bg-primary rounded-full" /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-outline-variant/10">
              <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">precision_manufacturing</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">Operational Excellence</h3>
              <p className="text-on-surface-variant leading-relaxed mb-8">Master your kitchen's pulse. Analyze ticket flow and station efficiency to eliminate bottlenecks before they start.</p>
              <div className="rounded-xl overflow-hidden shadow-sm">
                <img src={IMG.card1} alt="Kitchen analytics" className="w-full h-48 object-cover" />
              </div>
            </div>
            <div className="group p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-outline-variant/10">
              <div className="w-14 h-14 rounded-xl bg-secondary-container flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary text-3xl">insights</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">Financial Intelligence</h3>
              <p className="text-on-surface-variant leading-relaxed mb-8">True menu profitability. SCOOBY connects ingredient costs with sales velocity for automated margin optimization.</p>
              <div className="rounded-xl overflow-hidden shadow-sm">
                <img src={IMG.card2} alt="Financial dashboard" className="w-full h-48 object-cover" />
              </div>
            </div>
            <div className="group p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-outline-variant/10">
              <div className="w-14 h-14 rounded-xl bg-tertiary-container flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-tertiary text-3xl">forum</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">Sentiment &amp; Reputation</h3>
              <p className="text-on-surface-variant leading-relaxed mb-8">The Review Action Hub. Aggregate and respond to customer feedback across all platforms from a single interface.</p>
              <div className="rounded-xl overflow-hidden shadow-sm">
                <img src={IMG.card3} alt="Review sentiment" className="w-full h-48 object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Deep Dive — Bento Grid */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">Built for the Culinary Architect.</h2>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">Beyond dashboards. SCOOBY provides a holistic ecosystem that integrates every facet of your restaurant's lifecycle.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">

              {/* Large: Staff */}
              <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-10 flex flex-col md:flex-row gap-10 items-center overflow-hidden border border-outline-variant/5">
                <div className="flex-1 order-2 md:order-1">
                  <span className="text-primary font-bold text-sm tracking-widest uppercase mb-4 block">Team Dynamics</span>
                  <h4 className="font-headline text-3xl font-bold mb-4">Optimized Labor Management</h4>
                  <p className="text-on-surface-variant mb-6">Align your staff scheduling with predicted sales surges. Reduce labor costs while maintaining impeccable service standards.</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-semibold">
                      <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Predictive Shift Balancing
                    </li>
                    <li className="flex items-center gap-3 text-sm font-semibold">
                      <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Performance Tracking by Server
                    </li>
                  </ul>
                </div>
                <div className="flex-1 order-1 md:order-2 w-full">
                  <img src={IMG.staff} alt="Staff analytics" className="rounded-xl shadow-2xl w-full" />
                </div>
              </div>

              {/* Small: Trends */}
              <div className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/5">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-surface-container mb-6 flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface">trending_up</span>
                    </div>
                    <h4 className="font-headline text-2xl font-bold mb-3">Trend Forecasting</h4>
                    <p className="text-on-surface-variant text-sm mb-6">Anticipate culinary shifts. SCOOBY tracks regional and global food trends so your menu stays ahead of the curve.</p>
                  </div>
                  <img src={IMG.trends} alt="Trend forecasting" className="rounded-xl shadow-lg mt-auto" />
                </div>
              </div>

              {/* Medium: Ingredients */}
              <div className="md:col-span-5 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/5">
                <h4 className="font-headline text-2xl font-bold mb-3">Ingredient Integrity</h4>
                <p className="text-on-surface-variant text-sm mb-8">Monitor supply chain consistency and food waste patterns across multiple locations with granular data.</p>
                <div className="relative overflow-hidden rounded-xl">
                  <img src={IMG.ingredients} alt="Ingredient tracking" className="w-full" />
                </div>
              </div>

              {/* Quote */}
              <div className="md:col-span-7 rounded-2xl p-10 flex flex-col justify-center relative overflow-hidden" style={PREMIUM_GRADIENT}>
                <span className="material-symbols-outlined absolute -top-4 -right-4 text-on-primary/10" style={{ fontSize: '9rem' }}>format_quote</span>
                <div className="relative z-10">
                  <p className="font-headline text-2xl md:text-3xl font-bold text-on-primary italic mb-8 leading-relaxed">
                    "The Culinary Architect approach changed how we think about data. SCOOBY doesn't just show us numbers; it shows us the soul of our kitchen in real-time."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-on-primary/20 overflow-hidden ring-2 ring-on-primary/30 flex-shrink-0">
                      <img src={IMG.chef} alt="Marco Sterling" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-on-primary">Marco Sterling</p>
                      <p className="text-on-primary/70 text-sm font-medium">Executive Chef, Lumière Group</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-5xl mx-auto bg-inverse-surface text-on-tertiary rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary blur-[120px] rounded-full" />
            </div>
            <div className="relative z-10">
              <h2 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight mb-8">
                Ready to optimize your restaurant? Join the intelligence revolution.
              </h2>
              <p className="text-xl text-inverse-on-surface mb-12 max-w-2xl mx-auto">
                Start your journey toward operational mastery today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button onClick={onSignIn}
                  className="px-10 py-5 bg-white text-slate-900 font-headline font-extrabold text-xl rounded-2xl hover:bg-slate-100 transition-all shadow-xl hover:scale-105 active:scale-95">
                  Start Your Free Trial
                </button>
                <span className="text-on-tertiary font-bold hover:underline underline-offset-8 transition-all cursor-default">Speak with a Specialist</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full pt-16 pb-8 bg-slate-50">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 px-6 max-w-7xl mx-auto">
          <div className="col-span-2 lg:col-span-1">
            <div className="text-xl font-headline font-bold text-slate-900 mb-6">SCOOBY</div>
            <p className="text-sm text-slate-500 max-w-xs">The world's most advanced restaurant intelligence system for high-performance culinary teams.</p>
          </div>
          <div className="flex flex-col gap-4">
            <h5 className="font-semibold text-slate-900">Product</h5>
            <span className="text-sm text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline transition-all">Features</span>
            <span className="text-sm text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline transition-all">Solutions</span>
            <span className="text-sm text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline transition-all">Pricing</span>
          </div>
          <div className="flex flex-col gap-4">
            <h5 className="font-semibold text-slate-900">Company</h5>
            <span className="text-sm text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline transition-all">About Us</span>
            <span className="text-sm text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline transition-all">Careers</span>
            <span className="text-sm text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline transition-all">Contact</span>
          </div>
          <div className="flex flex-col gap-4">
            <h5 className="font-semibold text-slate-900">Legal</h5>
            <span className="text-sm text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline transition-all">Privacy Policy</span>
            <span className="text-sm text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline transition-all">Terms of Service</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2025 SCOOBY Restaurant Intelligence. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-slate-400 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined">share</span></span>
            <span className="text-slate-400 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined">mail</span></span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
