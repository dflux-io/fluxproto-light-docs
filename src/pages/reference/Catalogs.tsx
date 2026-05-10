import DocPage from '../../components/DocPage';
import { Link } from 'react-router-dom';

export default function Catalogs() {
  return (
    <DocPage slug="reference/catalogs">
<h1>Flow catalog</h1>
<p>Every flow shipped under <code>{`templates/`}</code>, grouped by protocol. The <code>{`YAML`}</code> column links to the source.</p>
<h2 id="ngap">NGAP</h2>
<table>
<thead><tr><th>Name</th><th>Category</th><th>NF role</th><th>Description</th><th>YAML</th></tr></thead>
<tbody><tr><td>deregistration</td><td>functional</td><td>gnb</td><td>Registration + UE-initiated deregistration from the 5G network</td><td><Link to="../../templates/gnb/deregistration.yaml">templates/gnb/deregistration.yaml</Link></td></tr>
<tr><td>duplicate_registration</td><td>negative</td><td>gnb</td><td>Registration + immediate re-registration with same SUCI — test AMF handling</td><td><Link to="../../templates/gnb/duplicate_registration.yaml">templates/gnb/duplicate_registration.yaml</Link></td></tr>
<tr><td>handover_source</td><td>functional</td><td>gnb</td><td>N2 inter-gNB handover from the source gNB perspective</td><td><Link to="../../templates/gnb/handover_source.yaml">templates/gnb/handover_source.yaml</Link></td></tr>
<tr><td>malformed_nas</td><td>robustness</td><td>gnb</td><td>Send InitialUEMessage with garbage NAS PDU — test AMF robustness</td><td><Link to="../../templates/gnb/malformed_nas.yaml">templates/gnb/malformed_nas.yaml</Link></td></tr>
<tr><td>ng_reset</td><td>functional</td><td>gnb</td><td>Registration + gNB-initiated global NG Reset for error recovery</td><td><Link to="../../templates/gnb/ng_reset.yaml">templates/gnb/ng_reset.yaml</Link></td></tr>
<tr><td>ng_setup</td><td>functional</td><td>gnb</td><td>NG Setup — establish NGAP signalling connection between gNB and AMF</td><td><Link to="../../templates/gnb/ng_setup.yaml">templates/gnb/ng_setup.yaml</Link></td></tr>
<tr><td>paging_response</td><td>stability</td><td>gnb</td><td>Registration + CM-IDLE transition + wait for AMF Paging + ServiceRequest reconnection</td><td><Link to="../../templates/gnb/paging_response.yaml">templates/gnb/paging_response.yaml</Link></td></tr>
<tr><td>pdu_session_reject</td><td>negative</td><td>gnb</td><td>Registration + PDU session request with invalid DNN — expect rejection</td><td><Link to="../../templates/gnb/pdu_session_reject.yaml">templates/gnb/pdu_session_reject.yaml</Link></td></tr>
<tr><td>pdu_session_release</td><td>functional</td><td>gnb</td><td>Registration + PDU session setup + UE-initiated session release</td><td><Link to="../../templates/gnb/pdu_session_release.yaml">templates/gnb/pdu_session_release.yaml</Link></td></tr>
<tr><td>pdu_session_setup</td><td>functional</td><td>gnb</td><td>Registration + PDU session establishment with GTP-U tunnel setup</td><td><Link to="../../templates/gnb/pdu_session_setup.yaml">templates/gnb/pdu_session_setup.yaml</Link></td></tr>
<tr><td>ran_config_update</td><td>functional</td><td>gnb</td><td>NGSetup + gNB-initiated RAN Configuration Update procedure</td><td><Link to="../../templates/gnb/ran_config_update.yaml">templates/gnb/ran_config_update.yaml</Link></td></tr>
<tr><td>registration</td><td>functional</td><td>gnb</td><td>5G UE initial registration with authentication and security activation</td><td><Link to="../../templates/gnb/registration.yaml">templates/gnb/registration.yaml</Link></td></tr>
<tr><td>registration_amf</td><td>functional</td><td>amf</td><td>AMF-side stub: receives InitialUEMessage, responds with UEContextReleaseCommand</td><td><Link to="../../templates/amf/registration_amf.yaml">templates/amf/registration_amf.yaml</Link></td></tr>
<tr><td>service_request</td><td>functional</td><td>gnb</td><td>Registration + CM-IDLE transition + Service Request reconnection</td><td><Link to="../../templates/gnb/service_request.yaml">templates/gnb/service_request.yaml</Link></td></tr>
<tr><td>ue_context_suspend</td><td>functional</td><td>gnb</td><td>Registration + gNB-initiated UE context suspend to RRC_INACTIVE</td><td><Link to="../../templates/gnb/ue_context_suspend.yaml">templates/gnb/ue_context_suspend.yaml</Link></td></tr>
<tr><td>uplane_traffic</td><td>functional</td><td>gnb</td><td>Registration + PDU session + user-plane GTP-U traffic generation</td><td><Link to="../../templates/gnb/uplane_traffic.yaml">templates/gnb/uplane_traffic.yaml</Link></td></tr></tbody>
</table>
<h2 id="diameter">Diameter</h2>
<table>
<thead><tr><th>Name</th><th>Category</th><th>NF role</th><th>Description</th><th>YAML</th></tr></thead>
<tbody><tr><td>diameter_gx_ccr_cca_init</td><td>functional</td><td>pgw</td><td>Gx CCR/CCA INITIAL 4-step echo against fgp</td><td><Link to="../../templates/diameter/gx/ccr_cca_init.yaml">templates/diameter/gx/ccr_cca_init.yaml</Link></td></tr>
<tr><td>diameter_gx_ccr_cca_terminate</td><td>functional</td><td>pgw</td><td>Gx CCR/CCA TERMINATION 4-step echo against fgp</td><td><Link to="../../templates/diameter/gx/ccr_cca_terminate.yaml">templates/diameter/gx/ccr_cca_terminate.yaml</Link></td></tr>
<tr><td>diameter_rx_aar_aaa_success</td><td>functional</td><td>af</td><td>Rx AAR/AAA 4-step echo against fgp</td><td><Link to="../../templates/diameter/rx/aar_aaa_success.yaml">templates/diameter/rx/aar_aaa_success.yaml</Link></td></tr>
<tr><td>diameter_s6a_air_aia_success</td><td>functional</td><td>mme</td><td>S6a AIR/AIA 4-step echo against fgp</td><td><Link to="../../templates/diameter/s6a/air_aia_success.yaml">templates/diameter/s6a/air_aia_success.yaml</Link></td></tr>
<tr><td>diameter_s6a_clr_cla_relay</td><td>functional</td><td>mme</td><td>S6a CLR/CLA 4-step echo (relay) against fgp</td><td><Link to="../../templates/diameter/s6a/clr_cla_relay.yaml">templates/diameter/s6a/clr_cla_relay.yaml</Link></td></tr>
<tr><td>diameter_s6a_idr_ida_relay</td><td>functional</td><td>mme</td><td>S6a IDR/IDA 4-step echo (relay) against fgp</td><td><Link to="../../templates/diameter/s6a/idr_ida_relay.yaml">templates/diameter/s6a/idr_ida_relay.yaml</Link></td></tr>
<tr><td>diameter_s6a_nor_noa_relay</td><td>functional</td><td>mme</td><td>S6a NOR/NOA 4-step echo (relay) against fgp</td><td><Link to="../../templates/diameter/s6a/nor_noa_relay.yaml">templates/diameter/s6a/nor_noa_relay.yaml</Link></td></tr>
<tr><td>diameter_s6a_pur_pua_success</td><td>functional</td><td>mme</td><td>S6a PUR/PUA 4-step echo against fgp</td><td><Link to="../../templates/diameter/s6a/pur_pua_success.yaml">templates/diameter/s6a/pur_pua_success.yaml</Link></td></tr>
<tr><td>diameter_s6a_rx_combined</td><td>lifecycle</td><td>mme</td><td>Multi-app S6a+Rx 4-step echo on one SCTP association</td><td><Link to="../../templates/diameter/multi/s6a_rx_combined.yaml">templates/diameter/multi/s6a_rx_combined.yaml</Link></td></tr>
<tr><td>diameter_s6a_rx_fgp_drops_aar</td><td>negative</td><td>mme</td><td>Multi-app S6a+Rx with Rx drop — S6a completes, AAR times out</td><td><Link to="../../templates/diameter/multi/s6a_rx_fgp_drops_aar.yaml">templates/diameter/multi/s6a_rx_fgp_drops_aar.yaml</Link></td></tr>
<tr><td>diameter_s6a_ulr_route_record_loop</td><td>negative</td><td>mme</td><td>S6a ULR/ULA error — DIAMETER_LOOP_DETECTED (3005)</td><td><Link to="../../templates/diameter/s6a/s6a_ulr_route_record_loop.yaml">templates/diameter/s6a/s6a_ulr_route_record_loop.yaml</Link></td></tr>
<tr><td>diameter_s6a_ulr_ula_success</td><td>functional</td><td>mme</td><td>S6a ULR/ULA 4-step echo against fgp</td><td><Link to="../../templates/diameter/s6a/ulr_ula_success.yaml">templates/diameter/s6a/ulr_ula_success.yaml</Link></td></tr>
<tr><td>diameter_s6a_ulr_ula_user_unknown</td><td>negative</td><td>mme</td><td>S6a ULR/ULA error — DIAMETER_ERROR_USER_UNKNOWN (5001)</td><td><Link to="../../templates/diameter/s6a/ulr_ula_user_unknown.yaml">templates/diameter/s6a/ulr_ula_user_unknown.yaml</Link></td></tr>
<tr><td>fgp_diameter_policy_allow_s6a_lifecycle</td><td>functional</td><td>mme</td><td>FGP S6a allow-rule lifecycle — default-deny PUR=5003, install allow-s6a, PUR=2001, delete, PUR=5003</td><td><Link to="../../templates/fgp/diameter/policy_allow_s6a_lifecycle.yaml">templates/fgp/diameter/policy_allow_s6a_lifecycle.yaml</Link></td></tr></tbody>
</table>
<h2 id="sbi">SBI</h2>
<table>
<thead><tr><th>Name</th><th>Category</th><th>NF role</th><th>Description</th><th>YAML</th></tr></thead>
<tbody><tr><td>sbi_nausf_authenticate_client</td><td>functional</td><td>ausf</td><td>Client POST against AUSF Nausf_UEAuthentication_Authenticate</td><td><Link to="../../templates/sbi/nausf_authenticate_client.yaml">templates/sbi/nausf_authenticate_client.yaml</Link></td></tr>
<tr><td>sbi_nausf_authenticate_server</td><td>functional</td><td>ausf</td><td>Server response template for Nausf_UEAuthentication_Authenticate</td><td><Link to="../../templates/sbi/nausf_authenticate_server.yaml">templates/sbi/nausf_authenticate_server.yaml</Link></td></tr>
<tr><td>sbi_nudm_sdm_get_client</td><td>functional</td><td>udm</td><td>Client GET against UDM Nudm_SDM_GetSubscriptionData</td><td><Link to="../../templates/sbi/nudm_sdm_get_client.yaml">templates/sbi/nudm_sdm_get_client.yaml</Link></td></tr>
<tr><td>sbi_nudm_sdm_get_server</td><td>functional</td><td>udm</td><td>Server response template for Nudm_SDM_GetSubscriptionData</td><td><Link to="../../templates/sbi/nudm_sdm_get_server.yaml">templates/sbi/nudm_sdm_get_server.yaml</Link></td></tr></tbody>
</table>
<h2 id="rest">REST</h2>
<table>
<thead><tr><th>Name</th><th>Category</th><th>NF role</th><th>Description</th><th>YAML</th></tr></thead>
<tbody><tr><td>rest_fgp_admin_add_pcc_rule_client</td><td>functional</td><td>external</td><td>Client POST to FGP admin API to install a PCC rule</td><td><Link to="../../templates/rest/fgp_admin_client.yaml">templates/rest/fgp_admin_client.yaml</Link></td></tr>
<tr><td>rest_fgp_admin_server</td><td>functional</td><td>external</td><td>Mock FGP admin API — accepts any pcc-rules POST and replies 201</td><td><Link to="../../templates/rest/fgp_admin_server.yaml">templates/rest/fgp_admin_server.yaml</Link></td></tr></tbody>
</table>
<h2 id="pfcp">PFCP</h2>
<table>
<thead><tr><th>Name</th><th>Category</th><th>NF role</th><th>Description</th><th>YAML</th></tr></thead>
<tbody><tr><td>pfcp_sm_setup_client</td><td>functional</td><td>smf</td><td>SMF establishes a PFCP association then a session against UPF</td><td><Link to="../../templates/pfcp/sm_setup_client.yaml">templates/pfcp/sm_setup_client.yaml</Link></td></tr>
<tr><td>pfcp_sm_setup_server</td><td>functional</td><td>upf</td><td>UPF accepts an SMF association + session establishment</td><td><Link to="../../templates/pfcp/sm_setup_server.yaml">templates/pfcp/sm_setup_server.yaml</Link></td></tr></tbody>
</table>
<h2 id="multi-protocol">Multi-protocol</h2>
<table>
<thead><tr><th>Name</th><th>Category</th><th>NF role</th><th>Description</th><th>YAML</th></tr></thead>
<tbody><tr><td>multinf_ngap_plus_diameter</td><td>functional</td><td>gnb (primary)</td><td>Mixed NGAP + Diameter burst on a single UE</td><td><Link to="../../templates/multinf/ngap_plus_diameter.yaml">templates/multinf/ngap_plus_diameter.yaml</Link></td></tr></tbody>
</table>
<p>40 flows total across 5 protocols (NGAP 16, Diameter 14, SBI 4, REST 2, PFCP 2, multi-protocol 1, FGP-policy 1).</p>
<p>Every suite shipped under <code>{`templates/suites/`}</code>.</p>
<table>
<thead><tr><th>Name</th><th>Category</th><th>Description</th><th>Steps</th><th>YAML</th></tr></thead>
<tbody><tr><td>gnb-register-deregister</td><td>—</td><td>Demo — register a small batch of UEs, then deregister</td><td>2</td><td><Link to="../../templates/suites/gnb_register_deregister.yaml">templates/suites/gnb_register_deregister.yaml</Link></td></tr></tbody>
</table>
<p>1 suite total.</p>
    </DocPage>
  );
}
