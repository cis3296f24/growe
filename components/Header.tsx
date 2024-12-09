import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Logo from '@/assets/icons/logo.svg';
import DefaultAvatar from '@/assets/images/Avatar.png';
import LogOut from '@/assets/icons/logOut.svg';
import Profile from '@/assets/icons/profile.svg';
import { Box } from '@/components/ui/box';
import {
    Menu,
    MenuItem,
    MenuItemLabel,
    MenuSeparator,
} from '@/components/ui/menu';
import { Icon } from '@/components/ui/icon';
import {
    Avatar,
    AvatarBadge,
    AvatarFallbackText,
    AvatarImage,
} from '@/components/ui/avatar';
import { auth } from '@/utils/firebaseConfig';
import { useRouter } from 'expo-router';

export default function Header() {

    const router = useRouter();

    const handleLogOut = async () => {
        try {
            router.push('/');
            await auth.signOut();
            console.log('Logged out');
        } catch (error) {
            console.log(error);
        }
    }

    const handleChangeAvatar = () => {
        console.log('Change Avatar');
    }

    return (
        <Box className='flex-row items-center justify-between bg-[#637162] p-5 pt-16'>
            <Box className='flex-row items-center justify-between w-full'>
                <Logo height={40} width={40} color={'#8F9C8F'}/>

                <Menu
                    className='bg-primaryGreen w-48 outline-none'
                    placement="top" 
                    offset={5}
                    disabledKeys={['Settings']}
                    trigger={({ ...triggerProps }) => {
                    return (
                        <TouchableOpacity { ...triggerProps }>
                            <Avatar size="md" >
                            <AvatarFallbackText>User</AvatarFallbackText>
                            <AvatarImage
                            source={DefaultAvatar}
                            />
                            </Avatar>
                        </TouchableOpacity>
                    );
                    }}
                >
                    <MenuItem key="Change Avatar" textValue="Change Avatar" onPress={handleChangeAvatar}>
                    <Icon as={Profile} size="lg" className="mr-3 text-white" />
                    <MenuItemLabel size="lg" className='text-white'>Change Avatar</MenuItemLabel>
                    </MenuItem>
                    <MenuItem key="Log Out" textValue="Log Out" onPress={handleLogOut}>
                    <Icon as={LogOut} size="lg" className="mr-3 text-white" />
                    <MenuItemLabel size="lg" className='text-white'>Log Out</MenuItemLabel>
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
}