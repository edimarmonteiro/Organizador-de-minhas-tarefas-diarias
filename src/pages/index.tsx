import Head from 'next/head';
import styles from '../styles/home.module.css';
import Image from 'next/image';
import hero from '../../public/assets/hero.png'

export default function Home() {
  return (
    <div className={styles.conteiner}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.image}
            alt="Logo Tarefas"
            src={hero}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar <br/>
          seus estudos e tarefas
        </h1>

        <div className={styles.infContent}>
          <section className={styles.inf}>
            <span>+12 Posts</span>
          </section>
          <section className={styles.inf}>
            <span>+90 Comentários</span>
          </section>
        </div>
      </main>
    </div>
  );
}
