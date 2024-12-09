import { Garden } from '../components/Garden';
import { Box } from '@/components/ui/box';

export default function HomeLayout() {
    return (
        <Box className="flex-1">
            <Garden />
        </Box>
    );
}