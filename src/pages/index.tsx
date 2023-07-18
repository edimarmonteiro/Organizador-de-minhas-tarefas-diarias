import Head from 'next/head';
import styles from '../styles/home.module.css';
import Image from 'next/image';
import hero from '../../public/assets/hero.png'
import { GetStaticProps } from 'next';
import { db } from "../services/firebaseConnection";
import { 
  collection,
  getDocs,
} from 'firebase/firestore';

//Tipagem dos elementos tarefas e comentarios
interface HomeProps {
  comments: number;
  tarefas: number;
}
export default function Home({ comments, tarefas }: HomeProps) {
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
            <span>+{tarefas} Posts</span>
          </section>
          <section className={styles.inf}>
            <span>+{comments} Comentários</span>
          </section>
        </div>
      </main>
    </div>
  );
}

//Pagina statica
export const getStaticProps: GetStaticProps = async () => {

  //Acessando os comentarios
  const commentRef = collection(db, "comment")
  const commentSnapshot = await getDocs(commentRef)

  //Acessando as tarefas
  const tarefasRef = collection(db, "tarefas")
  const tarefasSnapshot = await getDocs(tarefasRef)

  return {
    props:{
      //commentSnapshot.size == ira retorna o tamanho(qantidade de comentarios)
      comments: commentSnapshot.size || 0,
      tarefas: tarefasSnapshot.size || 0,
    },
    revalidate: 60, //A pagina sera revalidada(atualizada com os novos daos do bd) a cada 60 segundos
  };
};