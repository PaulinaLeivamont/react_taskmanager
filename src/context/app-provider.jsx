import AppContext from "./app-context";
import { useState } from "react";

let preloadUser = localStorage.getItem('user_data')
if (preloadUser) preloadUser = JSON.parse(preloadUser)
else preloadUser = {name: '', id: '', tasks: []}

const AppProvider = ({children}) => {

    const [user, setUser] = useState(preloadUser)

    const value = { user, setUser }

    const Provider = AppContext.Provider

    return <Provider value={value}>{children}</Provider>
}

export default AppProvider