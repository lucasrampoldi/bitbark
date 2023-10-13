export interface IInstanceDetails {
    id: number;
    instanceUuid: string;
    instanceUpdateDate: number;
    instanceCreateDate: number;
    instanceStatus: boolean;
    instanceUpdateState: boolean;
    instanceEdit: boolean;
    instanceClientVersion: string;
    instanceUserAuthenticationClient: string;
    instancePlatform: string;
    instanceEnvironment: string;
    tenancyId: number;
}
