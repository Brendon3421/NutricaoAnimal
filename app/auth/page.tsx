import LoginForm from "../../components/LoginForm"
import styles from "../../components/auth.module.css"

export const metadata = {
  title: "Login - Nutrição Animal",
}

export default function AuthPage() {
  return (
    <main className={styles.container}>
      <section className={styles.left} style={{backgroundImage: "url('/auth-hero.jpg')"}}>
        <div className={styles.leftInner}>
          <div style={{width:36,height:36,borderRadius:8,background:'#e8f6ea',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>🌱</div>
          <h2 className={styles.heroTitle}>Growing a better tomorrow</h2>
          <p className={styles.heroText}>Smart solutions for modern farming. Manage, monitor and maximize your yield with technology.</p>

          <div className={styles.features}>
            <div className={styles.featureCard}>
              <strong>Smart Farming</strong>
              <div className={styles.smallText}>Data driven decisions</div>
            </div>
            <div className={styles.featureCard}>
              <strong>Crop Health</strong>
              <div className={styles.smallText}>Monitor & protect your crops</div>
            </div>
            <div className={styles.featureCard}>
              <strong>Better Yield</strong>
              <div className={styles.smallText}>Increase productivity sustainably</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.right}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>A</div>
            <div>
              <h3 className={styles.title}>AgriConnect</h3>
              <div className={styles.subtitle}>Connect. Cultivate. Thrive.</div>
            </div>
          </div>

          <h1 style={{marginTop:12}}>Welcome Back!</h1>
          <p className={styles.smallText}>Login to continue your journey</p>

          <LoginForm />
        </div>
      </section>
    </main>
  )
}
