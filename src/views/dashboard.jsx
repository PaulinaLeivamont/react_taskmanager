import Header from "../components/header"
import Footer from "../components/footer"
import CustomButton from "../components/custom-button"
import InputText from "../components/input-text"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useApp from "../context/use-app"

const apiRoot = 'https://api-taskmanager.vercel.app/'

const Dashboard = () => {

    const navigate = useNavigate()
    const {user, setUser} = useApp()
    //'' si no se esta editando | 'id de la tarea' que se está editando
    const [editMode, setEditMode] = useState('')

    //cuando se edita una tarea, no se hace sobre el array original, 
    //de esta manera se puede cancelar la edición y el sort no afectará
    //a la tarea que se está editando.
    const [memory, setMemory] = useState({})

    //establece el orden de las tareas, [key, ascendente | descendente]
    const [sortingBy, setSortingBy] = useState(['id', 'asc'])

    if (user.id === '') navigate('/')

    const getTasks = () => {

        fetch(`${apiRoot}tasks/${user.id}`)
        .then((res) => res.json())
        .then((res) => setUser({...user, tasks: res}))
    }

    //primero añade la tarea a la base de datos, si la operación se cumple, se añade en el front.
    const addTask = () => {

        fetch(`${apiRoot}add`, {
            method : "POST",
            body : JSON.stringify({userId: user.id}),
            headers : {
                "Content-type" : "application/json"
            }
        })
        .then((res) => res.json())
        .then((res) => {
            if (typeof res === 'string') return
            setUser((prev) => ({...prev, tasks: [res, ...prev.tasks]}))
            //ponemos a editar la tarea añadida
            setEditMode(res.id)
            //al ordenar de esta manera nos aseguramos de que siempre aparezca arriba, sin tener
            //que preocuparnos por lo que tuviese seleccionado el usuario
            setSortingBy(['name','asc'])
        })
        
    }

    //edit la tarea en memoria, cuando se confirme la edicion, se actualizarán los cambios en la base de datos
    const editTask = (key, value) => setMemory((prev) => ({...prev, [key]: value}))

    //primero elimina la tarea a la base de datos, si la operación se cumple, se elimina en el front.
    const deleteTask = (id) => {
        fetch(`${apiRoot}delete`, {
            method : "DELETE",
            body : JSON.stringify({userId: user.id, taskId: id}),
            headers : {
                "Content-type" : "application/json"
            }
        })
        .then((res) => res.json())
        .then((res) => {
            if (res) setUser((prev) => (
                {...prev, tasks: prev.tasks.filter((task)=> task.id !== id )}
            ))
        })
    }

    //evita repetir algo de código
    const getTask = (id) => {

        let task = user.tasks.find((task) => task.id === id)
        if (task===undefined) return false
        else return task
    }

    useEffect(()=> {

        if (editMode==='' && Object.keys(memory).length === 4) {
            //se ha confirmado una edición
            fetch(`${apiRoot}edit`, {
                method : "PUT",
                body : JSON.stringify({userId: user.id, task: memory}),
                headers : {
                    "Content-type" : "application/json"
                }
            })
            .then((res) => res.json())
            .then((res) => {
                if (res) setUser((prev) => {
                    let newState = {...prev}
                    //busca la tarea en el array original y la sustituye por la editada
                    for (let i = 0; i < newState.tasks.length; ++i) {
                        if (newState.tasks[i].id === memory.id) {

                            newState.tasks[i] = {...memory}
                            break;
                        }
                    }
                    return newState
                })
                
            })
            //limpiamos el objeto en memoria para la siguiente vez que se dite
            setMemory({})
            return
        }

        //se ha comenzado a editar una tarea
        let task = getTask(editMode)//el id de la tarea estará en editMode
        if (!task) return
        setMemory(task)//copiamos esa tarea en memoria

    },[editMode])

    useEffect(() => {
        if (user.id !== '') getTasks()
    },[])

    return (
    <>
        <Header className={'dashboard'}>
            <CustomButton onClick={()=>{setUser({name: '', id: ''}); navigate('/')}} className="info_b">
                Log out
                <span className="material-symbols-outlined">logout</span>
            </CustomButton>
        </Header>
        <main className="dashboard">
        <div className="inside">
        <ul>
        {   user.tasks.length==0 ? 
            <li className="task empty text_m"><div><p>Add a new task to get started</p></div></li>
            :
            <>
            <li className="task disable headers text_m">
                <div></div>
                <div>
                    <CustomButton 
                        className={`text_m ${sortingBy[0]==='name' ? 'sortActive' : ''} ${sortingBy[1]}`}
                        //ordenar por nombre + toggle entre asc y desc
                        onClick={()=>setSortingBy((prev)=>['name', prev[0]==='name' && prev[1]==='asc' ? 'desc' : 'asc'])}
                    >
                        <p>Name</p>
                        <span className="material-symbols-outlined">
                            chevron_left
                        </span>
                    </CustomButton>
                </div>
                <div>
                    <CustomButton 
                        className={`text_m ${sortingBy[0]==='type' ? 'sortActive' : ''} ${sortingBy[1]}`}
                        //ordenar por tipo + toggle entre asc y desc
                        onClick={()=>setSortingBy((prev)=>['type', prev[0]==='type' && prev[1]==='asc' ? 'desc' : 'asc'])}
                    >
                        <p>Type</p>
                        <span className="material-symbols-outlined">
                            chevron_left
                        </span>
                    </CustomButton>
                </div>
                <div>
                    <CustomButton 
                        className={`text_m ${sortingBy[0]==='status' ? 'sortActive' : ''} ${sortingBy[1]}`}
                        //ordenar por status + toggle entra asc y desc
                        onClick={()=>setSortingBy((prev)=>['status', prev[0]==='status' && prev[1]==='asc' ? 'desc' : 'asc'])}
                    >
                        <p>Status</p>
                        <span className="material-symbols-outlined">
                            chevron_left
                        </span>
                    </CustomButton>
                </div>
                <div></div>
            </li>
            {
            user.tasks
            .sort((a, b) => {

                const asc = sortingBy[1] == 'asc'//evita repetir algo de código
                const key = sortingBy[0]//evita repetir algo de código

                switch (typeof a[key]) {
                    case 'string':
                        //si es string ordenamos alfabéticamente
                        if (asc) return a[key].localeCompare(b[key])
                        else return b[key].localeCompare(a[key])
                    default:
                        //si no, de menor a mayor o viceversa
                        if (asc) return Number(a[key]) - Number(b[key])
                        else return Number(b[key]) - Number(a[key])
                    break;
                }
            })
            .map((task, i)=>{

                let isEditing = (editMode===task.id)//evita repetir algo de código
                let reference = isEditing ? memory : task//asegura que el objeto que se modifica durante la edición sea el de la memoria y no el del array original
                //${i % 2===0 ? 'odd' : 'even'}`} esta clase permite colorear las filas de manera alterna
                return(
                    <li className={`task text_l ${!isEditing ? 'disable' : ''} ${i % 2===0 ? 'odd' : 'even'}`} key={task.id}>  
                        <div>
                            <CustomButton 
                                //toggle entre los ids de tareas y este mismo
                                onClick={()=>{setEditMode((prev)=>prev===task.id ? '' : task.id)}}
                                className={`${isEditing ? 'info_bg action' : 'info_b info_c'}`}
                            >
                                <span className="material-symbols-outlined">
                                    edit
                                </span>
                            </CustomButton>
                        </div>  
                        <div>
                            <InputText 
                                id={'task-name-'+task.id}
                                disable={!isEditing} 
                                className="text_m" 
                                value={reference.name}
                                onInput={(e)=>editTask('name', e.target.value)}
                            />
                        </div>
                        <div>
                            <InputText 
                                id={'task-type-'+task.id}
                                disable={!isEditing} 
                                className="text_m" 
                                value={reference.type}
                                onInput={(e)=>editTask('type', e.target.value)}
                            />
                        </div>
                        <div>
                            {   isEditing ?
                                <select 
                                    id={'task-status-'+task.id}
                                    className="text_m" 
                                    value={reference.status}
                                    onInput={(e)=>editTask('status', Number(e.target.value))}
                                >
                                    <option value={0}>Pending</option>
                                    <option value={1}>In progress</option>
                                    <option value={2}>Done</option>
                                </select>
                                :
                                <p className={`text_m ${['pen','pro','don'].at(reference.status)}`}>
                                    {['Pending','In progress','Done'].at(reference.status)}
                                </p>
                            }
                        </div>
                        <div>
                            <CustomButton 
                                className={`error_c`}
                                onClick={() => deleteTask(task.id)}
                            >
                                <span className="material-symbols-outlined">
                                    delete
                                </span>
                            </CustomButton>
                        </div>  
                    </li>
                )
            })
            }
            </>
        }
        </ul>
        </div>
        </main>
        <Footer className='dashboard'>
            <CustomButton 
                className={'info_bg action add'}
                onClick={()=>addTask()}
            >
                <span className="material-symbols-outlined">
                    add
                </span>
            </CustomButton>
        </Footer>
    </>
    )
}

export default Dashboard