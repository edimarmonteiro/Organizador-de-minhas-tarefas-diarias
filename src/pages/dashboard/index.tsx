import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import styles from './styles.module.css';
import Head from 'next/head';
import { Textarea } from '../../components/textarea/index';
import { FiShare2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';

//Banco de dados
import { db } from '../../services/firebaseConnection'
import { 
    addDoc, 
    collection,
    query,
    orderBy,
    where,
    onSnapshot,
    doc, //documento
    deleteDoc //Deletar documento
} from 'firebase/firestore';

interface HomeProps {
    user: {
        email: string
    };
}

interface TaskProps{
    id: string;
    create: Date;
    public: boolean;
    tarefa: string;
    user: string;
};

export default function Dashbord({ user }: HomeProps){

    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false)
    const [tasks, setTasks] = useState<TaskProps[]>([])

    useEffect(() => {
        async function loadTarefas(){
            const tarefasRef = collection(db, "tarefas");
            const q = query(
                tarefasRef, //coletando as informaçoes do usuario
                orderBy("create", "desc"), //deichando as informações de forma ordenadas
                where("user", "==", user?.email) //a informação só ira aparecer para cada usuario que a crialas
            );

                //Acessando os dados acima 
                onSnapshot(q, (snapshot) => {
                    let lista = [] as TaskProps[];

                    snapshot.forEach((doc) => {
                        lista.push({
                            id: doc.id,
                            tarefa: doc.data().tarefa,
                            create: doc.data().create,
                            user: doc.data().user,
                            public: doc.data().public,
                        });
                    });
                    setTasks(lista);
                });
        }

        loadTarefas();
    }, [user?.email])

    //Perfição de publica ou não
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setPublicTask(e.target.checked)
    }

    //Recebendo a resposta do formulario
    async function hanldeRegisterTask(e: FormEvent) {
        e.preventDefault();

        if(input === '') return;

        try{
            await addDoc(collection(db, "tarefas"), {
                tarefa: input,
                create: new Date(),
                user: user?.email,
                public: publicTask
            });
            //Voltar para vazio
            setInput("")
            //Voltar para false
            setPublicTask(false);
            
        } catch (erro) {
            console.log(erro)
        }
    }

    //Copiar url da tarefa
    async function handleShare(id: string) {
        //funcionalidade de copiar
        await navigator.clipboard.writeText(
            //URL da tarefa que sera copiada
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        );

        alert('URL copiada com sucesso!')
    }

    //deletar tarefa
    async function handleDeleteTask(id: string) {
        const docRef = doc(db, "tarefas", id)
        //Deletando
        await deleteDoc(docRef)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Meu paonel de tarefas</title>
            </Head>

            
                <main className={styles.main}>
                    <section className={styles.content}>
                    <div className={styles.divpai}>
                        <div className={styles.contentFrom}>
                            <h1 className={styles.title}>Qual sua tarefa?</h1>

                            <form onSubmit={hanldeRegisterTask}>
                                <Textarea
                                placeholder='Digite sua tarefa...'
                                value={input}
                                onChange={ (e: ChangeEvent<HTMLTextAreaElement> ) => 
                                    setInput(e.target.value)}
                                />
                                <div className={styles.checkboxArea}>
                                    <input
                                    type='checkbox' className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChange}
                                    />
                                    <label className={styles.label}>Deixar Tarefa Publica?</label>
                                </div>
                                <button className={styles.button} type='submit'>
                                    Registrar
                                </button>
                            </form>
                        </div>
                        </div>
                    </section>

                    <section className={styles.taskContainer}>
                        <h1>Minhas Tarefas</h1>

                        
                        {tasks.map((item) => (
                            <article key={item.id} className={styles.task}>
                            {item.public && ( 
                                <div className={styles.tagConteiner}>
                                    <label className={styles.tag}>PUBLICO</label>
                                    <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                                        <FiShare2 size={22} color="#3183ff"/>
                                    </button>
                                </div>
                            )}

                            <div className={styles.taskContent}>
                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                    <p>{item.tarefa}</p>
                                    </Link>
                                ) : (
                                    <p>{item.tarefa}</p>
                                )}

                                <button className={styles.trashButton} 
                                onClick={() => handleDeleteTask(item.id)}>
                                    <FaTrash size={24} color="#ea3140"/>
                                </button>
                            </div>
                        </article>
                        ))}
                    </section>
                </main>
        </div>
    )
}


//Trabalhando do lado do server
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });

    if (!session?.user) {
        //Se não tiver usuario vai ser redirecionado para o home
        return{
            redirect:{
                destination: "/",
                permanent: false
            },
        };
    }

    return {
        props: {
            user: {
                email: session?.user?.email,
            },
        },
    };
};