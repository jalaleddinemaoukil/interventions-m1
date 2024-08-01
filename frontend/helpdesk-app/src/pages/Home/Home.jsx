import React, { useEffect, useState } from 'react'
import Navbar from "../../components/Navbar"
import TaskCard from '../../components/TaskCard'
import { MdAdd } from 'react-icons/md'
import AddEditIntervention from './AddEditIntervention'
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import Toast from '../../components/Toast'
import EmptyCard from '../../components/EmptyCard'
import '../../../public/create-task-icon.svg';
import { getAdapter } from 'axios'

const Home = () => {

  const [openAddEditModal, setOpenAddEditModel] = useState({
    isShown: false,
    type: 'add',
    data: null,
  })


  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    type: 'add',

  });

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    })
  }

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    })
  }

  const [userInfo, setUserInfo] = useState(null)
  const [alltasks, setAllTasks] = useState([]);

  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (taskDetails) => {
    setOpenAddEditModel({ isShown: true, data: taskDetails, type: 'edit' });
  }

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/employee")
      if (response.data && response.data.user) {
        setUserInfo(response.data.user)
      }
    } catch (error) {
        if (error.response.status === 401 ) {
          localStorage.clear();
          navigate("/login");
        }
    }
  }


  //All-tasks (GET)
  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get("/get-all-tasks")

      if ( response.data && response.data.tasks){
        setAllTasks(response.data.tasks)
      }
    } catch (error) {
      console.log('Please try again')
    }
  }

  //delete-task

  const deleteTask = async (data) => {
    const taskId = data._id
    try {  
      const response = await axiosInstance.delete("/delete-task/"+taskId);


      if (response.data && !response.data.error) {
          showToastMessage("Task Deleted Successfully", 'delete');
          getAllTasks();
          onClose();
      }

  } catch (error) {

      if (error.response && error.response.data && error.response.data.message) {
        console.log('Please try again')
      }
  }
  }


  //SEARCH

  const onSearchTask = async (query) => {
    try {
      const response = await axiosInstance.get("/search-tasks", {params: {query},
    })

    if (response.data && response.data.tasks) {
      setIsSearch(true);
      setAllTasks(response.data.tasks)
    }
  } catch (error) {
    console.log(error);
  }

}
   const updateIsPinned = async (taskData) => {
    const taskId = taskData._id;
    try {


        const response = await axiosInstance.put("/update-task-pinned/"+taskId, {
          "isPinned": !taskId.isPinned,
        });

        console.log("Response from server:", response.data);

        if (response.data && response.data.task) {
            showToastMessage("Task Pinned Successfully");
            getAllTasks();
       
        }

    } catch (error) {
        console.log(error);
       
    }
  }

 const handleClearSearch = () => {
  setIsSearch(false);
  getAllTasks();
 }

  useEffect(() => {
    getAllTasks();
    getUserInfo();
    return () => {}
  }, [])
  return (
    <>

      <Navbar userInfo={userInfo} onSearchTask={onSearchTask} handleClearSearch={handleClearSearch}/>

      <div className='container mx-auto px-2'>
       {alltasks.length > 0 ? <div className='grid grid-cols-3 gap-4 mt-8'> 

         { alltasks.map((item, index) => (
            <TaskCard 
            key={item._id}
            title={item.title}
            date={item.createdOn}
            content={item.content}
            tags={item.tags}
            isPinned={item.isPinned} 
            onEdit={()=> handleEdit(item)} 
            onDelete={()=> deleteTask(item)} 
            onPinTask={()=> updateIsPinned(item)}/>
          
          ))}

        
        
        </div> : <EmptyCard imgSrc={`'../../../public/create-task-icon.svg'`} message={ isSearch ? 'No Tasks found matching your search' :
          "Start Creating your first task ! Click the 'Add' button to jot down your technical issues, missions, and reminders."
        }/>}
      </div>

      <button className='w-16 h-16 flex  items-center jusitfy-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10' onClick={() => {
        setOpenAddEditModel({ isShown: true, type: 'add', data: null })
      }}>
        <MdAdd  className='text-[42px] text-white mx-auto' />
      </button>


      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.2)',
        },
        }}
        contentLabel=""
        className="w-[50%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 "
        >
        <AddEditIntervention 
          type={openAddEditModal.type}
          taskData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModel({ isShown: false, type: 'add', data: null })
          }}
          getAllTasks={getAllTasks}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast 
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  )
}

export default Home