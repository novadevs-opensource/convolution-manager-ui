import { useEffect } from 'react';
import { SlUser } from "react-icons/sl";
import { useAuth } from '../../../../../hooks/useAuth';
import ContextMenu from '../../../../menus/ContextMenu';


const UserBlock: React.FC<{className?: string, hasMenu: boolean, hasBorder: boolean}> = ({ className, hasMenu, hasBorder }) => {
  const { userProfile, loadUserProfile, logout } = useAuth();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const options = [
    { label: 'Profile', href: '/profile', isExternal: false },
    { label: 'Logout', href: '#', isExternal: false, handler: logout },
    { label: 'Help & Support', href: import.meta.env.VITE_SUPPORT_URL ?? '#', isExternal: true },
  ];

  return (
    <div className={`bg-clouds-pattern rounded-lg  p-4 mb-4 ${hasBorder ? 'border' : ''} ${className ?? ''}`}>
      {hasMenu ? (
        <ContextMenu
          button={
            <div className='flex flex-row items-center gap-2 justify-end'>
              {userProfile?.wallet_address ? (
                <p className='font-semibold font-anek-latin'>{`${userProfile?.wallet_address.substr(0, 15)}...${userProfile?.wallet_address.substr(30, userProfile?.wallet_address?.length)}`}</p>
              ) : (
                <p className='font-semibold font-anek-latin'>{userProfile?.email}</p>
              )}
              <span 
                className='inline-block border border-black p-2 bg-black rounded-full shadow-md' 
                aria-expanded="false" 
                aria-haspopup="true"
              >
                <SlUser className='text-white' />
              </span>
            </div>
          }
          options={options}
        />
      ) : (
        <div className='flex flex-row items-center gap-2'>
          <span 
            className='inline-block border p-2 rounded-full border-black' 
            aria-expanded="false" 
            aria-haspopup="true"
          >
            <SlUser color='black' />
          </span>
          <p>{`${userProfile?.wallet_address?.substr(0, 15)}...${userProfile?.wallet_address?.substr(30, userProfile?.wallet_address?.length)}` || userProfile?.substr(0, 15) || userProfile?.name}</p>
        </div>
      )}

    </div>
  );
};

export default UserBlock;
