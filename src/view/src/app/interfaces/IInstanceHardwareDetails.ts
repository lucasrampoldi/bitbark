export interface IInstanceHardwareDetails {
    id: number;
    instanceUuid: string;
    hardwareModel: string;
    hardwareSerialNumber: string;
    hardwareManufacturer: string;
    hardwarePhysicalMemory: number;
    hardwareProcessor: string;
    hardwareProcessorArchitecture: string;
    tenancyId: number;
}
