import React from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Loading = () => {

  const { nextUrl } = useParams()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!nextUrl) return;

    const targetPath =
      nextUrl === "my-bookings" ? `/${nextUrl}?paid=1` : `/${nextUrl}`;

    const timeoutId = setTimeout(() => {
      navigate(targetPath);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [nextUrl, navigate]);
  return (
    <div className='flex justify-center items-center h-[80vh]'>
        <div className='animate-spin rounded-full h-14 w-14 border-2
        border-t-primary'></div>
    </div>
  )
}

export default Loading