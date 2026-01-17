import { useRef, useState } from "react"
import { AiOutlineCaretDown } from "react-icons/ai"
import { VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import useOnClickOutside from "../../../hooks/useOnClickOutside"
import { logout } from "../../../services/operations/authApi"

import { MdDashboardCustomize } from "react-icons/md";

export default function Dropdown() {
  const { user } = useSelector((state) => state.profile)
  const accountType = user.accountType;
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const r = (accountType==="Patient" ? "/patient-dashboard/overview" 
                : accountType==="Doctor"? "/doctor-dashboard" 
                : "/admin-dashboard");
  const handlelogout = (e) =>{
    e.preventDefault();
    dispatch(logout(navigate));
  }
  useOnClickOutside(ref, () => setOpen(false))

  if (!user){
    console.log("no user");
    localStorage.setItem("token",null);
  } 
  return (
    <button className="relative" onClick={() => setOpen(true)}>
      <div className="flex items-center gap-x-">
        <img
          src={user?.image}
          alt={`profile-${user?.firstName}`}
          className="aspect-square w-[30px] rounded-full object-cover"//The aspect-ratio property allows you to define the ratio between width and height of an element.
        />
        <AiOutlineCaretDown className="text-sm text-richblack-100" />
      </div>
      {open && (
        <div
        onClick={(e) => e.stopPropagation()}
          className="absolute top-[118%] -right-8 z-[1000] overflow-hidden rounded-md  border-[1px] bg-white"
          ref={ref}
        >
            
      <Link to={r} onClick={() => setOpen(false)} className=" w-full">
          <div className="flex w-full items-center gap-x-2 py-[10px] px-[12px] text-sm border-b-[1px] border-gray-200">
            <MdDashboardCustomize />
            <span className='text-nowrap'>Dashboard</span>
          </div>
        </Link>
       

 

          <div onClick={handlelogout}
            className="flex w-full items-center gap-x-2 py-[10px] px-[12px] text-sm"
          >
            <VscSignOut className="size-6" />
            Logout
          </div>
        </div>
      )}
    </button>
  )
}
