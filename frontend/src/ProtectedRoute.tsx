import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

async function verifyJWT(data) {
    const res = await axios.post('/auth/verify/superadmin',data, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
    }
    });
    if (!res.data.success) throw new Error('Error verifying JWT');
    return res.data;
}


function ProtectedRoute({ children }) {
  const [isAuthenticated,setIsAuthenticated] = useState(false);
  const navigate = useNavigate();


  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: verifyJWT,
    onSuccess: (data) => {
      if(data.success) {
            queryClient.invalidateQueries({
                queryKey: ['adminData'],
            });
            setIsLoading(false);
            setIsAuthenticated(true);
        }
      
    },
    onError :(error)=> {
        navigate("/admin/login");
    }
  });


  useEffect(()=> {
    mutation.mutate({token:localStorage.getItem("accessToken")});
  },[]);

//   if(!isAuthenticated) {
//     return <Navigate to="/admin/login" replace />;
//   }
  return children;
}

export default ProtectedRoute;
