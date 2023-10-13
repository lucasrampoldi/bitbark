export interface IInstanceNetworkDetails {
    id: number;
    instanceUuid: string;
    networkName: string;
    networkIpv4: string;
    networkIpv6: string;
    networkMaskIpv4: string;
    networkHardwareDescription: string;
    networkMacAddress: string;
    networkGateway: string;
    networkDnsServer: string;
    networkDnsSuffix: string;
    networkEnableDnsServer: boolean;
    networkEnableDynamicDnsServer: boolean;
    networkDhcpServer: string;
    networkPredetermined: boolean;
    networkSpeed: number;
    networkBytesSent: number;
    networkBytesReceived: number;
    networkSwitchName: string;
    networkSwitchPort: string;
    networkInterfaceType: string;
    networkOperationalStatus: string;
    tenancyId: number;
}
