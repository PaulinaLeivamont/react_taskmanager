const InputText = ({className='', value='', disable=false, onInput=()=>{}, id = ''}) => {
    return (
        <input id={id} type="text" className={`${className} ${disable ? 'input_disable' : ''}`} value={value} disabled={disable} onInput={onInput}/>
    )
}

export default InputText