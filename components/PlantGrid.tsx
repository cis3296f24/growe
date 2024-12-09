import { useEffect, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import Svg, { Path } from "react-native-svg";
import GrassSVG from '../assets/terrain/GrassSVG.svg';
import BushSVG from '../assets/terrain/BushSVG.svg';
import DirtSVG from '../assets/terrain/DirtSVG.svg';
import { useUser } from './UserContext';
import { getGarden } from '@/utils/garden';
import { collection, getDocs, query, where, doc, addDoc, updateDoc, getDoc, QuerySnapshot, DocumentSnapshot, DocumentReference } from 'firebase/firestore';

type Cell = {
    type: string;
    plantable: boolean;
    planted: boolean;
    plantImageUrl?: string;
};

type Grid = Cell[][];

export default function PlantGrid() {
    const [gridSize, setGridSize] = useState(3);
    const [grid, setGrid] = useState<Grid>([]);
    const { user } = useUser();
    const [plantImageUrls, setPlantImageUrls] = useState<string[]>(['https://firebasestorage.googleapis.com/v0/b/growe-5d9d1.firebasestorage.app/o/plants%2Fd4c7ced8-bab7-4a12-b5e0-5423271ea60c-Bird%20of%20Paradise-fruiting-1733687584833.svg?alt=media&token=8e203404-ea95-4ac9-8cdd-3c1e5886230f', 'https://firebasestorage.googleapis.com/v0/b/growe-5d9d1.firebasestorage.app/o/plants%2Fd4c7ced8-bab7-4a12-b5e0-5423271ea60c-Bird%20of%20Paradise-fruiting-1733687584833.svg?alt=media&token=8e203404-ea95-4ac9-8cdd-3c1e5886230f']);

    const BLOCK_TYPES = [
        { type: 'grass_block', plantable: true },
        { type: 'bush_block', plantable: false },
        { type: 'dirt_block', plantable: true },
    ];

    function BlockSVG({ blockType }: { blockType: string }) {
        const bushAdjustment = -16.5;
        if (blockType === 'grass_block') {
            return <GrassSVG width="100" height="100" />;
        } else if (blockType === 'bush_block') {
            return (
                <View style={{ transform: [{ translateY: bushAdjustment }] }}>
                    <BushSVG width="100" height="100" />
                </View>
            );
        } else if (blockType === 'dirt_block') {
            return <DirtSVG width="100" height="100" />;
        }
        return null;
    }

    const generateGrid = (size: number, oldGrid: Grid | null): Grid => {
        const newGrid = [];
        for (let r = 0; r < size; r++) {
            const row = [];
            for (let c = 0; c < size; c++) {
                if (oldGrid && oldGrid.length > 0) {
                    const oldSize = oldGrid.length;
                    const offset = Math.floor((size - oldSize) / 2);
                    const oldRow = r - offset;
                    const oldCol = c - offset;
                    if (oldRow >= 0 && oldRow < oldSize && oldCol >= 0 && oldCol < oldSize) {
                        row.push(oldGrid[oldRow][oldCol]);
                        continue;
                    }
                }
                const block = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];
                row.push({ ...block, planted: false });
            }
            newGrid.push(row);
        }
        return newGrid;
    };

    const plantPlants = (grid: Grid): Grid => {
        let updatedGrid = [...grid];
        let plantsToPlant = [...plantImageUrls];
        while (plantsToPlant.length > 0) {
            const availableCells: { row: number; col: number }[] = [];
            updatedGrid.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if (cell.plantable && !cell.planted) {
                        availableCells.push({ row: r, col: c });
                    }
                });
            });

            if (availableCells.length === 0) {
                // Increase grid size
                const newSize = gridSize + 2;
                setGridSize(newSize);
                updatedGrid = generateGrid(newSize, updatedGrid);
                continue;
            }

            for (let i = 0; i < availableCells.length && plantsToPlant.length > 0; i++) {
                const { row, col } = availableCells[i];
                updatedGrid[row][col] = {
                    ...updatedGrid[row][col],
                    planted: true,
                    plantImageUrl: plantsToPlant.shift(),
                };
            }

            break;
        }
        return updatedGrid;
    };

    useEffect(() => {
        if (!user) {
            const initialGrid = generateGrid(3, null);
            setGrid(initialGrid);
            return;
        }
        const fetchGarden = async (user: any) => {
            try {
                const gardenRef: DocumentReference = await getGarden(user);
                const gardenSnapshot = await getDoc(gardenRef);
                const gardenData = gardenSnapshot.data();
                if (gardenData) {
                    const gardenGrid = gardenData.grid;
                    const plantsRefs = gardenData.plants;
                    const plantsSnapshots = await Promise.all(plantsRefs.map((plantRef: any) => getDoc(plantRef)));
                    const plantsData = plantsSnapshots.map((plantSnapshot: any) => plantSnapshot.data());
                    // get last element of plant.growStateImageUrls
                    const plants = plantsData.map((plant: any) => {
                        const growStateImageUrls = plant.growStateImageUrls;
                        const imageUrl = growStateImageUrls[growStateImageUrls.length - 1];
                        return { ...plant, imageUrl };
                    });
                    console.log(plants);
                    setPlantImageUrls(plants.map((plant: any) => plant.imageUrl));
                    setGrid(gardenGrid);
                } else {
                    const initialGrid = generateGrid(4, null);
                    setGrid(initialGrid);
                }
            } catch (error) {
                console.error('Error fetching garden for user', user, error);
                const initialGrid = generateGrid(4, null);
                setGrid(initialGrid);
            }
        };
        fetchGarden(user);
    }, []);

    useEffect(() => {
        if (plantImageUrls.length > 0) {
            let updatedGrid = grid;
            do {
                updatedGrid = plantPlants(updatedGrid);
            } while (plantImageUrls.length > 0);
            setGrid(updatedGrid);
            // Save the new grid
            if (user) {
                const saveGarden = async () => {
                    try {
                        const gardenRef: DocumentReference = await getGarden(user);
                        await updateDoc(gardenRef, { grid: updatedGrid });
                    } catch (error) {
                        console.error('Error saving garden', error);
                    }
                };
                saveGarden();
            }
        }
    }, [plantImageUrls]);

    const tileWidth = 128;
    const tileHeight = 64;

    return (
        <View style={styles.container}>
            <View style={styles.gridContainer}>
                {grid.map((row, r) =>
                    row.map((cell, c) => (
                        <View
                            key={`${r}-${c}`}
                            style={[
                                styles.cell,
                                {
                                    transform: [
                                        { translateX: ((c - r) * tileWidth / 2 * 0.6) - 60 },
                                        { translateY: ((c + r) * tileHeight / 2 * 0.6) - 60 },
                                    ],
                                },
                            ]}
                        >
                            <BlockSVG blockType={cell.type} />
                            {cell.planted && cell.plantImageUrl && (
                                <Image
                                    source={{ uri: cell.plantImageUrl }}
                                    style={styles.plantImage}
                                />
                            )}
                        </View>
                    ))
                )}
            </View>
        </View>
    );
}

const tileWidth = 128;
const tileHeight = 64;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        position: 'relative',
    },
    cell: {
        width: tileWidth,
        height: tileHeight,
        position: 'absolute',
    },
    plantImage: {
        position: 'absolute',
        width: 60,
        height: 60,
        top: 0,
        left: 0,
    },
});
