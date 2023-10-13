export interface IInstanceStorageDetails {
    id: number;
    instanceUuid: string;
    storageDriveName: string;
    storageDriveId: string;
    storageFileSystem: string;
    storageFreeSpace: number;
    storageTotalSpace: number;
}
