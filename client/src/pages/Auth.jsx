import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from "axios"
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Auth() {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  
  // Email Auth State
  const [isSignUp, setIsSignUp] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")

  const handleBackendAuth = async (name, email) => {
    // using the existing /api/auth/google endpoint as it works for general auth (creates user if not exists)
    const result = await axios.post(serverUrl + "/api/auth/google" , {name: name || "User" , email},{
      withCredentials:true
    })
    dispatch(setUserData(result.data))
  }

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const response = await getRedirectResult(auth)
        if (response?.user) {
          setLoading(true)
          await handleBackendAuth(response.user.displayName, response.user.email)
        }
      } catch (error) {
        console.error("Redirect auth error:", error)
        setErrorMsg("Failed to sign in. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    checkRedirect()
  }, [dispatch])

  const handleGoogleAuth = async () => {
    setErrorMsg("")
    try {
      const response = await signInWithPopup(auth, provider)
      setLoading(true)
      if (response?.user) {
        await handleBackendAuth(response.user.displayName, response.user.email)
      }
    } catch (error) {
      console.log("Popup sign in error:", error)
      if (error.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider)
        } catch (redirectError) {
          console.error("Redirect auth error:", redirectError)
          setErrorMsg("Popup blocked and redirect failed. Please enable popups or try a different browser.")
          setLoading(false)
        }
      } else {
        setErrorMsg("Sign in failed. Please try again.")
        setLoading(false)
      }
    }
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setErrorMsg("")
    setLoading(true)
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput)
        await handleBackendAuth(nameInput, userCredential.user.email)
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput)
        await handleBackendAuth(userCredential.user.displayName, userCredential.user.email)
      }
    } catch (error) {
      console.error("Email auth error:", error)
      // Make error message more user friendly
      if (error.code === 'auth/email-already-in-use') setErrorMsg("Email is already in use. Please sign in.")
      else if (error.code === 'auth/invalid-credential') setErrorMsg("Invalid email or password.")
      else if (error.code === 'auth/weak-password') setErrorMsg("Password should be at least 6 characters.")
      else setErrorMsg("Authentication failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen overflow-hidden bg-white text-black px-8 pb-10'>
        <motion.header 
        initial = {{opacity: 0 , y:-15}}
        animate = {{opacity:1 , y:0}}
        transition={{duration:1.5}}
       
        className=" max-w-7xl mx-auto mt-8
          rounded-2xl
          bg-black/80 backdrop-blur-xl
          border border-white/10
          px-8 py-6
          shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
          >
            <h1 className='text-2xl font-bold
            bg-linear-to-r from-white via-gray-300 to-white
            bg-clip-text text-transparent'>ExamNotes AI</h1>
            <p className='text-sm text-gray-300 mt-1'>AI-powered exam-oriented notes & revision</p>

        </motion.header>

        <main className='max-w-7xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start'>
        
        {/* LEFT CONTENT */}
        <motion.div 
         initial = {{opacity: 0 , x:-60}}
        animate = {{opacity:1 , x:0}}
        transition={{duration:0.7}}
        >
            <h1 className='text-5xl lg:text-6xl font-extrabold leading-tight
              bg-gradient-to-br from-black/90 via-black/60 to-black/90
              bg-clip-text text-transparent'>
                Unlock Smart <br /> AI Notes
              </h1>
              
              <div className="mt-10 max-w-sm">
                <motion.button
                onClick={handleGoogleAuth}
                disabled={loading}
                whileHover={loading ? {} : {
                  y:-4,
                  scale:1.02
                }}
                whileTap={loading ? {} : {scale:0.97}}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                 className={`w-full px-6 py-3 rounded-xl
                flex items-center justify-center gap-3
                bg-gradient-to-br from-black/90 via-black/80 to-black/90
                border border-white/10
                text-white font-semibold text-lg
                shadow-[0_15px_30px_rgba(0,0,0,0.4)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <FcGoogle size={22}/>
                  {loading ? "Please wait..." : "Continue with Google"}
                </motion.button>

                <div className="flex items-center gap-4 my-6">
                  <div className="h-[1px] w-full bg-gray-200"></div>
                  <span className="text-gray-400 text-sm font-medium">OR</span>
                  <div className="h-[1px] w-full bg-gray-200"></div>
                </div>

                <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                  {isSignUp && (
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={nameInput}
                      onChange={(e)=>setNameInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      required
                    />
                  )}
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    value={emailInput}
                    onChange={(e)=>setEmailInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                  />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={passwordInput}
                    onChange={(e)=>setPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full px-6 py-3 rounded-xl bg-black text-white font-semibold text-lg hover:bg-black/80 transition-colors shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
                  </button>
                </form>
                
                <p className="mt-4 text-center text-gray-600 text-sm">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"} 
                  <button onClick={(e)=>{e.preventDefault(); setIsSignUp(!isSignUp); setErrorMsg("")}} className="ml-1 text-black font-semibold hover:underline">
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>

                {errorMsg && (
                  <p className="mt-4 text-red-500 text-sm font-medium text-center">{errorMsg}</p>
                )}
              </div>

              <p className=' mt-10 max-w-xl text-lg
              bg-gradient-to-br from-gray-700 via-gray-500/80 to-gray-700
              bg-clip-text text-transparent'>
                You get <span className="font-semibold">50 FREE credits</span> to create
            exam notes, project notes, charts, graphs and
            download clean PDFs — instantly using AI.
              </p>
              <p className='mt-4 text-sm text-gray-500'> Start with 50 free credits • Upgrade anytime for more credits • Instant access</p>

        </motion.div>

        {/* RIGHT CONTENT */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 lg:mt-6'>
            <Feature icon="🎁" title="50 Free Credits" des="Start with 50 credits to generate notes without paying."/>
             <Feature icon="📘" title="Exam Notes" des="High-yield, revision-ready exam-oriented notes." />
          <Feature icon="📂" title="Project Notes" des="Well-structured documentation for assignments & projects." />
          <Feature icon="📊" title="Charts & Graphs" des="Auto-generated diagrams, charts and flow graphs." />
          <Feature icon="⬇️" title="Free PDF Download" des="Download clean, printable PDFs instantly." />

        </div>


        </main>
      
    </div>
  )
}
function Feature({icon , title , des}){
    return(
        <motion.div 
        whileHover={{ y: -12, rotateX: 8, rotateY: -8, scale: 1.05 }}
       transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className='relative rounded-2xl p-6
        bg-gradient-to-br from-black/90 via-black/80 to-black/90
        backdrop-blur-2xl
        border border-white/10
        shadow-[0_30px_80px_rgba(0,0,0,0.7)]
        text-white'
         style={{ transformStyle: "preserve-3d" }}
        >
         
            <div className='relative z-10' style={{ transform: "translateZ(30px)" }}>
                 <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{des}</p>

            </div>
          


        </motion.div>
    )
}

export default Auth
