export interface IBufferMananger {
    createFile(filename: string);
    destroyFile(filename: string);
    openFile(filename: string): IFileHandle;
    closeFile(filename: string);
}

export interface IFileHandle {
    getFirstBlock(): Block;
    getLastBlock(): Block;
    getNextBlock(blockId: number): Block;
    getPrevBlock(blockId: number): Block;
    pinBlock();
    unpinBlock();
    setDirty();
    isDirty(): bool;
}

export class BufferManager {
    
}
