import { plusIconWhite } from '../../assets/icons'
import './Button.css'

export default function Button({ text, openCreateModal }) {
  return (
    <button onClick={openCreateModal} id='botonAzul'>
      <img src={plusIconWhite} alt="" />
      {text}
    </button>
  )
}