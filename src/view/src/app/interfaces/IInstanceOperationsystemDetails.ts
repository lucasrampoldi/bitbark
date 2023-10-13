export interface IInstanceOperationSystemDetails {
    id: number;
    instanceUuid: string;
    operationSystemDomain: string;
    operationSystemDomainControllerAddress: string;
    operationSystemDomainControllerName: string;
    operationSystemWorkgroup: string;
    operationSystemServicePack: string;
    operationSystemHostname: string;
    operationSystemDescription: string;
    operationSystemInstallationDate: number;
    operationSystemLastBootUpTime: number;
    operationSystemName: string;
    operationSystemArchitecture: string;
    operationSystemLanguage: string;
    operationSystemVersion: string;
    operationSystemImage: string;
    operationSystemVersionIe: string;
    tenancyId: number;
}
