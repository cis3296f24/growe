import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import GrassSVG from '../assets/terrain/GrassSVG.svg';
import BushSVG from '../assets/terrain/BushSVG.svg';
import DirtSVG from '../assets/terrain/DirtSVG.svg';

type Cell = {
    type: string;
    plantable: boolean;
    planted: boolean;
};

type Grid = Cell[][];

export default function ProceduralPlatform() {
    const [gridSize, setGridSize] = useState(3);
    const [grid, setGrid] = useState<Grid>([]);

    const BLOCK_TYPES = [
        { type: 'grass_block', plantable: true },
        { type: 'bush_block', plantable: false },
        { type: 'dirt_block', plantable: true },
    ];

    function BlockSVG({ blockType }: { blockType: string }) {
        const bushAdjustment = -16;
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

    useEffect(() => {
        const initialGrid = generateGrid(3, null);
        setGrid(initialGrid);
    }, []);

    useEffect(() => {
        const MAX_GRID_SIZE = 10;
        if (grid.length > 0 && gridSize < MAX_GRID_SIZE) {
            const stillPlantable = grid.some(row =>
                row.some(cell => cell.plantable && !cell.planted)
            );
            if (!stillPlantable) {
                const newSize = gridSize + 2;
                const expandedGrid = generateGrid(newSize, grid);
                setGridSize(newSize);
                setGrid(expandedGrid);
            }
        }
    }, [grid, gridSize]);

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
                                        { translateX: (c - r) * tileWidth / 2 },
                                        { translateY: (c + r) * tileHeight / 2 },
                                    ],
                                },
                            ]}
                        >
                            <BlockSVG blockType={cell.type} />
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
        backgroundColor: '#333',
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
});
