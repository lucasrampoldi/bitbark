export interface IInstanceRouteDetails {
    id: number;
    instanceUuid: string;
    routeDestination: string;
    routeMask: string;
    routeNextHop: string;
    routeInterfaceIndex: string;
    routeMetric: string;
    routeInstallationDate: number;
    routeDescription: string;
    routeType: string;
    tenancyId: boolean;
}
