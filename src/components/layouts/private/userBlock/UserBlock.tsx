import { useEffect } from 'react';
import { SlUser } from "react-icons/sl";

import { useAuth } from '../../../../hooks/useAuth';
import ContextMenu from '../../../menus/ContextMenu';


const UserBlock = () => {
  const { userProfile, loadUserProfile, logout } = useAuth();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const options = [
    { label: 'Logout', href: '#', isExternal: false, handler: logout },
  ];

  return (
    <div className="bg-white rounded-lg p-4 mb-4 border">
      <ContextMenu
          button={
            <div className='flex flex-row items-center gap-2 justify-end'>
              <p>{userProfile?.email || userProfile?.name}</p>
              <span 
                className='inline-block border p-2 rounded-full border-black' 
                aria-expanded="false" 
                aria-haspopup="true"
              >
                <SlUser color='black' />
              </span>
            </div>
          }
          options={options}
        />
    </div>
  );
};

export default UserBlock;
