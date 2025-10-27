import { Outlet } from "react-router-dom"
import BottomNav from "../components/BottomNav"

const Overlay = () => {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}

export default Overlay