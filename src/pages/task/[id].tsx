//para especificar que irei receber um parameto do tipo ID

import { GetServerSideProps } from "next";
import Head from "next/head";
import styles from './styles.module.css';
import { db } from "@/services/firebaseConnection";
import {  doc, collection, query, where, getDoc } from "firebase/firestore"
import { redirect } from "next/dist/server/api-utils";
//importando o função de escrever os textos
import { Textarea } from '../../components/textarea'

interface TaskProps {
    item: {
        tarefa: string;
        create: string;
        public: boolean;
        user: string;
        taskId: string;
    }
}

export default function Task( { item }: TaskProps ) {
    return (
        <div className={styles.container}>
            <Head>
                <title>Detalhes das tarefas</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>
                        {item.tarefa}
                    </p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar Comentário</h2>

                <form>
                    <Textarea
                    placeholder="Digite seu comentario..."
                    />
                    <button className={styles.button}>
                        Enviar comentário
                    </button>
                </form>
            </section>
        </div>
    );
}

//Pegando o ID da TAREFA do lado co Servidor
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;

    const docRef = doc(db, "tarefas", id);
    const snapshot = await getDoc(docRef);

    if(snapshot.data() === undefined){
        return{
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    if(!snapshot.data()?.public){
        return{
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    //Editando a hora da criação
    const miliseconds = snapshot.data()?.create?.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        create: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }

    
    return {
        props: {
            item: task,
        },
    };
};