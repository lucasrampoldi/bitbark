export interface IInstanceSecurityDetails {
    id: number;
    instanceUuid: string;
    securityFirewall: string;
    securitySoftwareAv: string;
    securityRemoteDesktop: string;
    securityCurrentLoggedUser: string;
    tenancyId: number;
}
