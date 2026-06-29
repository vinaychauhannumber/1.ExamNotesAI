import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import axios from 'axios';
import { serverUrl } from '../App';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useDispatch } from 'react-redux';

const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
};

function Pricing() {
  const navigate = useNavigate()
  
  return (
    <PayPalScriptProvider options={initialOptions}>
    <div className='min-h-screen bg-gray-100 px-6 py-10 relative'>
      <button onClick={()=>navigate("/")} className='flex items-center gap-2 text-gray-600 hover:text-black mb-6'>
        ⬅️ Back
      </button>

      <motion.div 
      initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10">
          <h1 className="text-3xl font-bold">Buy Credits</h1>
        <p className="text-gray-600 mt-2">
          Choose a plan that fits your study needs
        </p>
      </motion.div>

      <div className='max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6'>
        <PricingCard 
          title="Starter"
          price="$1.99"
          amount="1.99"
          credits="50 Credits"
          description="Perfect for quick revisions"
          features={[
            "Generate AI notes",
            "Exam-focused answers",
            "Diagram & charts support",
            "Fast generation"
          ]}
         />

          <PricingCard
          popular
          title="Popular"
          price="$4.99"
          amount="4.99"
          credits="120 Credits"
          description="Best value for students"
          features={[
            "All Starter features",
            "More credits per $",
            "Revision mode access",
            "Priority AI response"
          ]}
        />

        <PricingCard
          title="Pro Learner"
          price="$9.99"
          amount="9.99"
          credits="300 Credits"
          description="For serious exam preparation"
          features={[
            "Maximum credit value",
            "Unlimited revisions",
            "Charts & diagrams",
            "Ideal for full syllabus"
          ]}
        />
      </div>
    </div>
    </PayPalScriptProvider>
  )
}

function PricingCard({
  title,
  price,
  amount,
  credits,
  description,
  features,
  popular
}){
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const createOrder = async () => {
    try {
      const result = await axios.post(serverUrl + "/api/credit/order", { amount }, { withCredentials: true });
      return result.data.id;
    } catch (err) {
      console.error(err);
      setError("Failed to create order");
      throw err;
    }
  };

  const onApprove = async (data) => {
    try {
      const result = await axios.post(serverUrl + "/api/credit/capture", { orderID: data.orderID }, { withCredentials: true });
      if (result.data.success) {
        navigate("/payment-success");
      } else {
        navigate("/payment-failed");
      }
    } catch (err) {
      console.error(err);
      navigate("/payment-failed");
    }
  };

  return(
  <motion.div  
  whileHover={{ y: -4 }}
      className={`
        relative rounded-xl p-6 bg-white border transition flex flex-col h-full
        ${popular ? "border-indigo-500" : "border-gray-200"}
      `}>
       {popular && <span className='absolute top-4 right-4 text-xs px-2 py-1 rounded bg-indigo-600 text-white'>Popular</span>}

       <h2 className='text-xl font-semibold'>{title}</h2>
       <p className='text-sm text-gray-500 mt-1'>{description}</p>

       <div className='mt-4 mb-4'>
        <p className="text-3xl font-bold">{price}</p>
        <p className="text-sm text-indigo-600">{credits}</p>
       </div>
       
       <div className="mt-auto relative z-10 w-full min-h-[45px]">
         <PayPalButtons
           createOrder={createOrder}
           onApprove={onApprove}
           style={{ layout: "horizontal", color: "blue", shape: "rect", label: "paypal", height: 40 }}
         />
         {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
       </div>

        <ul className='mt-6 space-y-2 text-sm text-gray-600'>
          {features.map((f, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-green-600">✓</span>
            {f}
          </li>
        ))}
        </ul>
  </motion.div>
  )
}

export default Pricing
