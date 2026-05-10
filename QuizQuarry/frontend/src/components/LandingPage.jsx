import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', borderBottom: '3px solid var(--border)', background: 'var(--bg-card)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)', margin: 0 }}>QuizQuarry</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login"><button className="btn-outline" style={{ padding: '10px 24px' }}>Sign In</button></Link>
          <Link to="/register"><button className="btn-accent" style={{ padding: '10px 24px' }}>Get Started Free</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'var(--accent-light)', border: '2px solid var(--border)', borderRadius: '100px', padding: '6px 20px', fontWeight: 700, fontSize: '0.8rem', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
          Powered by AI
        </div>
        <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.03em' }}>
          Create AI-generated quizzes<br />
          <span style={{ color: 'var(--accent)' }}>in seconds, not hours.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          QuizQuarry lets instructors generate, edit, and publish quizzes from any topic using AI. Students get instant feedback, explanations, and live proctoring.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link to="/register"><button className="btn-accent" style={{ padding: '16px 36px', fontSize: '1.1rem' }}>Start Creating Free</button></Link>
          <a href="#how-it-works"><button className="btn-secondary" style={{ padding: '16px 36px', fontSize: '1.1rem' }}>See How It Works</button></a>
        </div>
      </section>

      {/* Trust bar */}
      <div style={{ background: 'var(--primary)', borderTop: '3px solid var(--border)', borderBottom: '3px solid var(--border)', padding: '18px 0', textAlign: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.04em' }}>
          Trusted by educators &bull; AI-powered &bull; Built for speed &bull; Free to start
        </span>
      </div>

      {/* How It Works */}
      <section id="how-it-works" style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>How it works</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>From idea to published quiz in 3 simple steps</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          {[
            { step: '01', title: 'Describe Your Topic', desc: 'Enter a title and describe the concepts you want to test. Set question count, time limits, and access type.', color: 'var(--accent)' },
            { step: '02', title: 'AI Generates Questions', desc: 'Our AI engine instantly creates MCQs with options, correct answers, and detailed explanations for each question.', color: 'var(--blue)' },
            { step: '03', title: 'Review & Publish', desc: 'Edit any question, add more, or delete. When ready, publish and share the access code with your students.', color: 'var(--green)' }
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-section)', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.4rem', fontWeight: 900, color: item.color, boxShadow: 'var(--shadow-sm)' }}>
                {item.step}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: item.color, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step {item.step}</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'var(--bg-section)', borderTop: '3px solid var(--border)', borderBottom: '3px solid var(--border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>Features that set us apart</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Everything you need to create, deliver, and analyze assessments</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {[
              { title: 'Per-Question Timer', desc: 'Each question has its own countdown. When time runs out, it auto-advances — keeping exams fast-paced and cheat-proof.' },
              { title: 'Tab Switch Proctoring', desc: 'Every tab switch is detected and recorded. Set a maximum limit, and students are warned in real-time.' },
              { title: 'Private Access Codes', desc: 'Generate 6-digit codes for private quizzes. Only students with the code can attempt the test.' },
              { title: 'Detailed Analytics', desc: 'See per-student accuracy, time taken, and score breakdowns. Identify weak areas and top performers instantly.' },
              { title: 'Full Question Editor', desc: 'Edit any AI-generated question, option, correct answer, or explanation. Add more questions dynamically with one click.' },
              { title: 'AI Explanations', desc: 'Every question comes with a detailed AI-generated explanation, helping students learn from their mistakes immediately.' }
            ].map((f, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '28px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--accent-light)', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Instructors / Students */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card" style={{ padding: '36px', borderLeft: '6px solid var(--accent)' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>For Instructors</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Generate quizzes from any concept in seconds', 'Full inline editor for questions, options, answers', 'Set per-question time limits and tab switch limits', 'View detailed student reports with accuracy & time', 'Publish with auto-generated private access codes'].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--green)', fontWeight: 800 }}>&#10003;</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ padding: '36px', borderLeft: '6px solid var(--blue)' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>For Students</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Attempt quizzes with a clean, distraction-free UI', 'Per-question countdown creates engaging challenges', 'See your score, correct answers, and AI explanations', 'Track your progress on the global leaderboard', 'Join private quizzes using 6-digit access codes'].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--blue)', fontWeight: 800 }}>&#10003;</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--primary)', borderTop: '3px solid var(--border)', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '2.4rem', marginBottom: '16px' }}>Ready to create your first quiz?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 36px' }}>
          Join thousands of educators using AI to build better assessments. Free to start.
        </p>
        <Link to="/register">
          <button className="btn-accent" style={{ padding: '18px 48px', fontSize: '1.15rem', boxShadow: '5px 5px 0px 0px rgba(255,255,255,0.3)' }}>
            Get Started Free
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '3px solid var(--border)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
        <span style={{ fontWeight: 800, color: 'var(--accent)' }}>QuizQuarry</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>2026 QuizQuarry. AI-powered quiz generation.</span>
      </footer>
    </div>
  );
};

export default LandingPage;
