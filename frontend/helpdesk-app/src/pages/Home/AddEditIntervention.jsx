import React, { useState } from 'react'
import TagInput from '../../components/TagInput'
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosInstance';

const AddEditTask = ({ taskData = {}, type, onClose, getAllTasks, showToastMessage }) => {
    const [title, setTitle] = useState(taskData?.title || '');
    const [content, setContent] = useState(taskData?.content || '');
    const [companyName, setcompanyName] = useState(taskData?.companyName || '');
    const [companyNumber, setcompanyNumber] = useState(taskData?.companyNumber || '');
    const [tags, setTags] = useState(taskData?.tags || []);
    const [isPinned, setIsPinned] = useState(taskData?.isPinned || false); // Add this line
    const [error, setError] = useState(null);

    const AddNewTask = async () => {
        try {
            const taskData = { title, companyName, companyNumber, content, tags, isPinned }; // Include isPinned
            console.log("Sending task data:", taskData);

            const response = await axiosInstance.post("/add-task", taskData);

            console.log("Response from server:", response.data);

            if (response.data && response.data.task) {
                showToastMessage("Task Added Successfully");
                getAllTasks();
                onClose();
            }

        } catch (error) {
            console.error("Error adding task:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            }
        }
    };

    const EditTask = async () => {
        const taskId = taskData._id;
        try {
            const taskData = { title, content,companyName,companyNumber, tags, isPinned }; // Include isPinned
            
            console.log("Sending task data:", taskData);

            const response = await axiosInstance.put("/edit-task/"+taskId, taskData);

            console.log("Response from server:", response.data);

            if (response.data && response.data.task) {
                showToastMessage("Task Updated Successfully");
                getAllTasks();
                onClose();
            }

        } catch (error) {
            console.error("Error adding task:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            }
        }
    };

    const handleAddTask = () => {
        if (!title) {
            setError("Please enter the title");
            return;
        }
        if (!companyName) {
            setError("Please enter the Company Name");
            return;
        }
        if (!companyNumber) {
            setError("Please enter the Company Phone Number");
            return;
        }

        if (!content) {
            setError("Please write the Description");
            return;
        }

        setError("");

        if (type === 'edit') {
            EditTask();
        } else {
            AddNewTask();
        }
    };

    return (
        <div className='relative'>
            <button className='w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50' onClick={onClose}>
                <MdClose className="text-xl text-slate-400 m-auto" />
            </button>
            <div className='flex flex-col gap-2'>
                <label className='input-label'>TITLE</label>
                <input type="text" className='text-2xl text-slate-950 outline-none' placeholder='Intervention Title'
                    value={title}
                    onChange={({ target }) => setTitle(target.value)} />
            </div>
            <div className='flex flex-col gap-2 my-1'>
                <label className='input-label'>Company Name</label>
                <input type="text" className='text-2xl text-slate-950 outline-none' placeholder='Company x'
                    value={companyName}
                    onChange={({ target }) => setcompanyName(target.value)} />
            </div>
            <div className='flex flex-col gap-2 my-1'>
                <label className='input-label'>Company Phone Number</label>
                <input type="text" className='text-2xl text-slate-950 outline-none' placeholder='Company Phone Number'
                    value={companyNumber}
                    onChange={({ target }) => setcompanyNumber(target.value)} />
            </div>
            <div className='flex flex-col gap-2 mt-4'>
                <label className='input-label'>Description</label>
                <textarea typeof='text' className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
                    placeholder='Describe the Intervention'
                    rows={10}
                    value={content}
                    onChange={({ target }) => setContent(target.value)}>
                </textarea>
            </div>

            <div className='mt-3'>
                <label className='input-label'>TAGS</label>
                <TagInput tags={tags} setTags={setTags} />
            </div>

            <div className='mt-3'>
                <label className='input-label'>PIN TASK</label>
                <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
            </div>

            {error && <p className='text-red-500 text-xs pt-4'>{error}</p>}

            <button className='btn-primary font-medium mt-5 p-3' onClick={handleAddTask}>
                {type === 'edit' ? 'UPDATE' : 'ADD'}
            </button>
        </div>
    );
}

export default AddEditTask;
