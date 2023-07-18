//para especificar que irei receber um parameto do tipo ID

import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState} from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import styles from './styles.module.css';
import { db } from "@/services/firebaseConnection";
import { 
    doc, 
    collection, 
    query, 
    where,
    getDoc,
    addDoc,
    getDocs,
    deleteDoc 
} from "firebase/firestore"
import { redirect } from "next/dist/server/api-utils";
//importando o função de escrever os textos
import { Textarea } from '../../components/textarea'
import { FaTrash } from 'react-icons/fa'

interface TaskProps {
    item: {
        tarefa: string;
        create: string;
        public: boolean;
        user: string;
        taskId: string;
    };
    allComents: CommentProps[]
}

//Tipagem dos comment
interface CommentProps {
    id: string;
    comment: string;
    user: string;
    name: string;
    taskId: string;
}

export default function Task( { item, allComents}: TaskProps ) {

    const { data: session } = useSession();
    const [input, setInput] = useState("")
    //allComents || [] == Para inicializar com todos os comentarios ou nenhum
    const [comments, setComments] = useState<CommentProps[]>(allComents || [])

    async function handleComment(e: FormEvent) {
        e.preventDefault();

        //Se não escrever nada não ira enviar
        if(input === "") return;
        //Se não estiver nome e email, não ira enviar
        if(!session?.user?.name || !session?.user?.email) return;

        try{
            const docRef = await addDoc(collection(db, "comments"), {
                //Vamos colocar o que iremos querer dentro do comentario
                comment: input,
                create: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            })

            //Para assim que o novo comentario ser criado ele sejá adicionado com os outros, sem precisar recaregar a pagina
            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            }

            //Vai pegar todos os comentarios já realizados([...oldItems]) e adicionar o novo([data])
            setComments((oldItems) => [...oldItems, data])
            setInput("");
        }catch(erro){
            console.log(erro)
        }
        
    }

    //Deletando comentario
    async function  handleDelectCommente(id: string) {
        try{
            const docRef = doc(db, "comment", id)
            //deletando
            await deleteDoc(docRef);

            /*deletando sem precisar recarregar a pagina
            comments=== useState que está recebendo os comentarios
            .filter( (item) => item.id)=== ira filtrar os item(comentarios)
             !== id === se o item filtrado for diferente do (id) que eu estou deletando não delet, mas se for igual delet*/
            const deletComment = comments.filter( (item) => item.id !== id)

            //novo valor para os comentarios
            setComments(deletComment)
        } catch(erro) {
            console.log(erro)
        }
    }
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
                    </p>name
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar Comentário</h2>

                <form onSubmit={handleComment}>
                    <Textarea
                    placeholder="Digite seu comentario..."
                    value={input}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                    />
                    <button className={styles.button} disabled={!session?.user}>

                        Enviar comentário
                    </button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos comentarios</h2>
                {comments.length === 0 && (
                    <span>Nenhum comentario foi encontrado...</span>
                )}

                {comments.map((item) => (
                    <article key={item.id} className={styles.comment}>
                        <div className={styles.headComment}>
                            <label className={styles.commentsLabel}>{item.name}</label>
                            {/*Função da lixeira só aparecer para cada usuario  que comentou */}
                            {item.user === session?.user?.email && (
                                <button className={styles.buttonTrash}
                                onClick={() => handleDelectCommente(item.id)}
                                >
                                    <FaTrash size={18} color="#EA3140" />
                                </button>
                            )}
                        </div>
                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>
        </div>
    );
}

//Pegando o ID da TAREFA do lado co Servidor
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;

    const docRef = doc(db, "tarefas", id);
    //Acesando os comentarios 
    const q = query(collection(db, "comments"), where("taskId", "==", id))
    const snapshotComments = await getDocs(q)
    let allComments: CommentProps[] = [];
    //forEac== Ira pecorrer todos os documentos
    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId
        })
    })

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
            //\pasando o array para o coponents
            allComents: allComments,
        },
    };
};