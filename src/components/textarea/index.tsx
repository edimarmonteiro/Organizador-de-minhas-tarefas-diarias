import { HTMLProps } from 'react'
import styles from './styles.module.css'
/* ...rest == pegar tos as propriedades desse elemento
HTMLProps == só posso receber html props
HTMLTextAreaElement == tipo do html que sera utilizado
*/ 
/*
HTMLProps<HTMLTextAreaElement> == Assim eu posso colocar valores diferente em cada 
components, atraves de props
*/
export function Textarea({ ...rest }: HTMLProps<HTMLTextAreaElement>) {
    return <textarea className={styles.textarea} { ...rest }></textarea>
}