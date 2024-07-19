import { createContext } from "react";

const AppContext = createContext({
  user: {name: '', id: '', tasks: []},
  setUser: () => {}
})

export default AppContext