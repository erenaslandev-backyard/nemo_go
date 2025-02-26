$(function () {
    load_domainscan_config();
    //搜索任务
    $("#search").click(function () {
        $("#hidden_org_id").val($("#select_org_id_search").val())
        $("#domain_table").DataTable().draw(true);
    });
    //显示创建任务
    $("#create_task").click(function () {
        var checkIP = [];
        $('#domain_table').DataTable().$('input[type=checkbox]:checked').each(function (i) {
            checkIP[i] = $(this).val().split("|")[1];
        });
        $('#text_target').val(checkIP.join("\n"));
        $('#newTask').modal('toggle');
    });
    //XSCAN窗口
    $("#create_xscan_task").click(function () {
        var checkIP = [];
        $('#domain_table').DataTable().$('input[type=checkbox]:checked').each(function (i) {
            checkIP[i] = $(this).val().split("|")[1];
        });
        $('#text_target_xscan').val(checkIP.join("\n"));
        $('#newXScan').modal('toggle');
        load_pocfile_list();
    });
    $("#block_domain").click(function () {
        swal({
                title: "确定要一键拉黑域名吗?",
                text: "该操作会将“第一个”选择的的“主域名”加入到黑名单列表中，同时从数据库中删除该主域名下的所有子域名、以及关联的所有IP！",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                closeOnConfirm: true
            },
            function () {
                let selItem = $('#domain_table').DataTable().$('input[type=checkbox]:checked');
                if (selItem.length >= 1) {
                    let id = selItem.val().split("|")[0];
                    $.ajax({
                        type: 'post',
                        url: 'domain-block?id=' + id,
                        success: function (data) {
                            $('#domain_table').DataTable().draw(false);
                        },
                        error: function (xhr, type) {
                        }
                    });
                }
            });
    });
    //启动任务 
    $("#start_task").click(function () {
        const target = $('#text_target').val();
        if (!target) {
            swal('Warning', '请至少输入一个Target', 'error');
            return;
        }
        if (target.length > 5000) {
            swal('Warning', '目标Targets长度不能超过5000', 'error');
            return;
        }
        let cron_rule = "";
        if ($('#checkbox_cron_task').is(":checked")) {
            cron_rule = $('#input_cron_rule').val();
            if (!cron_rule) {
                swal('Warning', '请输入定时任务规则', 'error');
                return;
            }
        }
        if (getCurrentTabIndex('#nav_tabs') == 0) {
            $.post("/task-start-domainscan",
                {
                    "target": target,
                    'org_id': $('#select_org_id_task').val(),
                    'subdomainbrute': $('#checkbox_subdomainbrute').is(":checked"),
                    'fld_domain': $('#checkbox_fld_domain').is(":checked"),
                    'portscan': $('#checkbox_portscan').is(":checked"),
                    'fofasearch': $('#checkbox_fofasearch').is(":checked"),
                    'quakesearch': $('#checkbox_quakesearch').is(":checked"),
                    'huntersearch': $('#checkbox_huntersearch').is(":checked"),
                    'networkscan': $('#checkbox_networkscan').is(":checked"),
                    'taskmode': $('#select_taskmode').val(),
                    'porttaskmode': $('#select_porttaskmode').val(),
                    'subfinder': $('#checkbox_subfinder').is(":checked"),
                    'crawler': $('#checkbox_crawler').is(":checked"),
                    'httpx': $('#checkbox_httpx').is(":checked"),
                    'screenshot': $('#checkbox_screenshot').is(":checked"),
                    'icpquery': $('#checkbox_icpquery').is(":checked"),
                    'whoisquery': $('#checkbox_whoisquery').is(":checked"),
                    'fingerprinthub': $('#checkbox_fingerprinthub').is(":checked"),
                    'iconhash': $('#checkbox_iconhash').is(":checked"),
                    'fingerprintx': $('#checkbox_fingerprintx').is(":checked"),
                    'taskcron': $('#checkbox_cron_task').is(":checked"),
                    'cronrule': cron_rule,
                    'croncomment': $('#input_cron_comment').val(),
                    'ignoreoutofchina': $('#checkbox_ignorecdn_outofchina').is(":checked"),
                    'ignorecdn': $('#checkbox_ignorecdn_outofchina').is(":checked"),
                    'proxy': $('#checkbox_proxy').is(":checked"),
                }, function (data, e) {
                    if (e === "success" && data['status'] == 'success') {
                        swal({
                                title: "新建任务成功！",
                                text: "TaskId:" + data['msg'],
                                type: "success",
                                confirmButtonText: "确定",
                                confirmButtonColor: "#41b883",
                                closeOnConfirm: true,
                            },
                            function () {
                                $('#newTask').modal('hide');
                            });
                    } else {
                        swal('Warning', "添加任务失败! " + data['msg'], 'error');
                    }
                });
        } else {
            if ($('#checkbox_xray').is(":checked") == false && $('#checkbox_nuclei').is(":checked") == false && $('#checkbox_goby').is(":checked") == false) {
                swal('Warning', '请选择要使用的验证工具！', 'error');
                return;
            }
            if ($('#checkbox_nuclei').is(":checked")) {
                if ($('#input_nuclei_poc_file').val() == '') {
                    swal('Warning', '请选择poc file', 'error');
                    return;
                }
            }
            $.post("/task-start-vulnerability", {
                "target": target,
                'xrayverify': $('#checkbox_xray').is(":checked"),
                'xray_poc_file': $('#select_poc_type').val() + '|' + $('#input_xray_poc_file').val(),
                'nucleiverify': $('#checkbox_nuclei').is(":checked"),
                'nuclei_poc_file': $('#input_nuclei_poc_file').val(),
                'gobyverify': $('#checkbox_goby').is(":checked"),
                'load_opened_port': false,
                'taskcron': $('#checkbox_cron_task').is(":checked"),
                'cronrule': cron_rule,
                'croncomment': $('#input_cron_comment').val(),
                'proxy': $('#checkbox_proxy').is(":checked"),
            }, function (data, e) {
                if (e === "success" && data['status'] == 'success') {
                    swal({
                            title: "新建任务成功！",
                            text: "TaskId:" + data['msg'],
                            type: "success",
                            confirmButtonText: "确定",
                            confirmButtonColor: "#41b883",
                            closeOnConfirm: true,
                        },
                        function () {
                            $('#newTask').modal('hide');
                        });
                } else {
                    swal('Warning', "添加任务失败! " + data['msg'], 'error');
                }
            });
        }
    });
    $("#start_xscan_task").click(function () {
        const formData = new FormData();
        if (getCurrentTabIndex('#nav_tabs_xscan') === 0) {
            const target = $('#text_target_xscan').val();
            if (!target) {
                swal('Warning', '请至少输入一个Target', 'error');
                return;
            }
            if (target.length > 5000) {
                swal('Warning', '目标Targets长度不能超过5000', 'error');
                return;
            }
            formData.append("xscan_type", "xdomainscan");
            formData.append("target", target)
            formData.append("onlineapi", $('#checkbox_onlineapi_xscan').is(":checked"));
        } else if (getCurrentTabIndex('#nav_tabs_xscan') === 2) {
            const target = $('#text_target_onlineapi_xscan').val();
            if (!target) {
                swal('Warning', '请输入查询的语法', 'error');
                return;
            }
            if (target.length > 5000) {
                swal('Warning', 'Targets长度不能超过5000', 'error');
                return;
            }
            formData.append("xscan_type", "xonlineapi");
            formData.append("target", target);
            formData.append("onlineapi_engine", $('#select_onlineapi_engine_xscan').val())
        } else {
            if ($('#select_org_id_task_xscan').val() === "") {
                swal('Warning', '必须选择要执行任务的组织！', 'error');
                return
            }
            formData.append("xscan_type", "xorgdomainscan");
        }
        let cron_rule = "";
        if ($('#checkbox_cron_task_xscan').is(":checked")) {
            cron_rule = $('#input_cron_rule_xscan').val();
            if (!cron_rule) {
                swal('Warning', '请输入定时任务规则', 'error');
                return;
            }
        }
        formData.append("org_id", $('#select_org_id_task_xscan').val());
        formData.append("fingerprint", $('#checkbox_fingerpint_xscan').is(":checked"));

        formData.append("xraypoc", $('#checkbox_xraypoc_xscan').is(":checked"));
        formData.append("xraypocfile", $('#select_xray_poc_type_xscan').val() + '|' + $('#input_xray_poc_file_xscan').val());
        formData.append("nucleipoc", $('#checkbox_nucleipoc_xscan').is(":checked"));
        formData.append("nucleipocfile", $('#input_nuclei_poc_file_xscan').val());
        formData.append("gobypoc", $('#checkbox_gobypoc_xscan').is(":checked"));

        formData.append("taskcron", $('#checkbox_cron_task_xscan').is(":checked"));
        formData.append("cronrule", cron_rule);
        formData.append("croncomment", $('#input_cron_comment_xscan').val());
        formData.append("proxy", $('#checkbox_proxy_xscan').is(":checked"));

        if ((formData.get("xraypoc") === "true" || formData.get("nucleipoc") === "true" || formData.get("gobypoc") === "true") && formData.get("fingerprint") === "false") {
            swal('Warning', '漏洞扫描需要开启指纹扫描步骤选项', 'error');
            return;
        }

        $.ajax({
            url: '/task-start-xscan',
            type: 'POST',
            cache: false,
            data: formData,
            processData: false,
            contentType: false
        }).done(function (res) {
            if (res['status'] == "success") {
                swal({
                        title: "新建任务成功！",
                        text: res['msg'],
                        type: "success",
                        confirmButtonText: "确定",
                        confirmButtonColor: "#41b883",
                        closeOnConfirm: true,
                    },
                    function () {
                        $('#newXScan').modal('hide');
                    });
            } else {
                swal('Warning', '新建任务失败！' + res['msg'], 'error');
            }
        }).fail(function (res) {
            swal('Warning', '新建任务失败！' + res['msg'], 'error');
        });
    });

    $("#checkbox_cron_task").click(function () {
        if (this.checked) {
            $("#input_cron_rule").prop("disabled", false);
            $("#input_cron_comment").prop("disabled", false);
            $("#label_cron_rule").prop("disabled", false);
        } else {
            $("#input_cron_rule").prop("disabled", true);
            $("#input_cron_comment").prop("disabled", true);
            $("#label_cron_rule").prop("disabled", true);
        }
    })
    $("#checkbox_cron_task_xscan").click(function () {
        if (this.checked) {
            $("#input_cron_rule_xscan").prop("disabled", false);
            $("#input_cron_comment_xscan").prop("disabled", false);
            $("#label_cron_rule_xscan").prop("disabled", false);
        } else {
            $("#input_cron_rule_xscan").prop("disabled", true);
            $("#input_cron_comment_xscan").prop("disabled", true);
            $("#label_cron_rule_xscan").prop("disabled", true);
        }
    })
    $("#domain_export").click(function () {
        let url = 'domain-export?';
        url += get_export_options();

        window.open(url);
    });
    $("#domain_statistics").click(function () {
        let url = 'domain-statistics?';
        url += get_export_options();

        window.open(url);
    });
    $("#domain_memo_export").click(function () {
        var url = 'domain-memo-export?';
        url += get_export_options();

        window.open(url);
    });
    //批量删除
    $("#batch_delete").click(function () {
        batch_delete('#domain_table', '/domain-delete');
    });
    // workspace
    get_user_workspace_list();
    $('#select_workspace').change(function () {
        change_user_workspace('#domain_table');
    });
    $('#select_poc_type').change(function () {
        load_pocfile_list(true, false, $('#select_poc_type').val())
    });
    $('#select_xray_poc_type_xscan').change(function () {
        load_pocfile_list(true, false, $('#select_xray_poc_type_xscan').val())
    });
    $('#domain_table').DataTable(
        {
            "paging": true,
            "serverSide": true,
            "autowidth": false,
            "sort": false,
            "pagingType": "full_numbers",//分页样式
            'iDisplayLength': 50,
            "dom": '<i><t><"bottom"lp>',
            "ajax": {
                "url": "/domain-list",
                "type": "post",
                "data": function (d) {
                    init_dataTables_defaultParam(d);
                    return $.extend({}, d, {
                        "org_id": $('#hidden_org_id').val(),
                        "ip_address": $('#ip_address').val(),
                        "domain_address": $('#domain_address').val(),
                        "color_tag": $('#select_color_tag').val(),
                        "memo_content": $('#memo_content').val(),
                        "date_delta": $('#date_delta').val(),
                        "create_date_delta": $('#create_date_delta').val(),
                        'disable_fofa': $('#checkbox_disable_fofa').is(":checked"),
                        'disable_banner': $('#checkbox_disable_banner').is(":checked"),
                        'select_no_ip': $('#checkbox_select_no_ip').is(":checked"),
                        'content': $('#content').val(),
                        'select_order_by_date': $('#checkbox_select_order_by_date').is(":checked"),
                        "domain_http": $('#http_content').val(),
                    });
                }
            },
            columns: [
                {
                    data: "id",
                    width: "6%",
                    className: "dt-body-center",
                    title: '<input  type="checkbox" class="checkall" />',
                    "render": function (data, type, row) {
                        let strData = '<input type="checkbox" class="checkchild" value="' + row['id'] + "|" + row['domain'] + '"/>';
                        if (row['memo_content']) {
                            strData += '&nbsp;<span class="badge  badge-primary" data-toggle="tooltip" data-html="true" title="' + html2Escape(row['memo_content']) + '"><i class="fa fa-flag"></i></span>';
                        }
                        return strData;
                    }
                },
                {
                    data: "index", title: "序号", width: "5%",
                    "render": function (data, type, row, meta) {
                        let strData = data;
                        if (row["pinindex"] === 1) strData = '<i class="fa fa-thumb-tack fa-rotate-90" style="color: orange" title="已置顶"></i>';
                        if (row["honeypot"].length > 0) {
                            strData = "<span style='color:red;font-weight:bold' title='" + row["honeypot"] + "'>蜜罐</span>";
                        }
                        return strData;
                    }
                },
                {
                    data: "domain",
                    title: "域名",
                    width: "12%",
                    render: function (data, type, row, meta) {
                        let strData;
                        let disable_fofa = $('#checkbox_disable_fofa').is(":checked");
                        if (row['color_tag']) {
                            strData = '<h5><a href="/domain-info?workspace=' + row['workspace'] + '&&domain=' + data + '&&disable_fofa=' + disable_fofa + '" target="_blank" class="badge ' + row['color_tag'] + '">' + data + '</a></h5>';
                        } else {
                            strData = '<a href="/domain-info?workspace=' + row['workspace'] + '&&domain=' + data + '&&disable_fofa=' + disable_fofa + '" target="_blank">' + data + '</a>';
                        }
                        if (row['vulnerability']) {
                            strData += '&nbsp;<span class="badge badge-danger" data-toggle="tooltip" data-html="true" title="' + html2Escape(row['vulnerability']) + '"><i class="fa fa-bolt"></span>';
                        }
                        if (row["domaincdn"].length > 0) {
                            strData += "&nbsp;<span class=\"badge badge-pill badge-warning\" title=\"" + row["domaincdn"] + "\">CDN</span>\n";
                        }
                        if (row["domaincname"].length > 0) {
                            strData += "&nbsp;<span class=\"badge badge-pill badge-info\" title=\"" + row["domaincname"] + "\">CNAME</span>\n";
                        }
                        if (row["statuscode"].length > 0) {
                            strData += "<br>[" + row["statuscode"] + "]";
                        }
                        return strData;
                    }
                },
                {
                    data: "ip", title: "IP && Port", width: "20%",
                    "render": function (data, type, row, meta) {
                        let strData = '<div style="width:100%;white-space:normal;word-wrap:break-word;word-break:break-all;">';
                        let pre_link = "";
                        let disable_fofa = $('#checkbox_disable_fofa').is(":checked");
                        for (let j = 0; j < data.length; j++) {
                            strData += pre_link
                            let ipV46 = data[j];
                            if (isIpv6(data[j])) ipV46 = "[" + data[j] + "]";
                            strData += '<a href="ip-info?workspace=' + row['workspace'] + '&&ip=' + data[j] + '&&disable_fofa=' + disable_fofa + '" target="_blank">' + ipV46 + '</a>';
                            pre_link = ",";
                        }
                        if (row["ipcdn"]) {
                            strData += "&nbsp;<span class=\"badge badge-pill badge-warning\" title=\"IP可能使用了CDN\">CDN</span>\n";
                        }
                        if (row["port"].length > 0) {
                            pre_link = "";
                            strData += "<br>[";
                            for (let j = 0; j < row["port"].length; j++) {
                                strData += pre_link;
                                let port = row["port"][j];
                                if (port === 443 || port === 8443) {
                                    strData += '<a href="https://' + row["domain"] + ":" + port + '"  target="_blank">' + port + '</a>';
                                } else {
                                    strData += '<a href="http://' + row["domain"] + ":" + port + '"  target="_blank">' + port + '</a>';
                                }
                                pre_link = "&nbsp;"
                            }
                            strData += "]";
                        }

                        strData += '</div>';
                        return strData;
                    }
                },
                {
                    data: "banner", title: "Icon && Title && Banner", width: "25%",
                    "render": function (data, type, row, meta) {
                        let icons = '';
                        for (let i in row['iconimage']) {
                            icons += '<img src=/webfiles/' + row['workspace_guid'] + '/iconimage/' + row['iconimage'][i] + ' width="24px" height="24px"/>&nbsp;';
                        }
                        if (icons !== "") icons += "<br>";

                        let title_array = [];
                        for (let key of Object.keys(row['title'])) {
                            title_array.push(key)
                        }
                        let titles_all = title_array.toString();
                        let title = encodeHtml(titles_all.substr(0, 200));
                        if (titles_all.length > 200) title += '......';
                        if (title !== "") title += "<br>";

                        let banner_array = [];
                        for (let key of Object.keys(row['banner'])) {
                            banner_array.push(key)
                        }
                        let banner_all = banner_array.toString();
                        let banner = encodeHtml(banner_all.substr(0, 200));
                        if (banner_all.length > 200) banner += '......';
                        return '<div style="width:100%;white-space:normal;word-wrap:break-word;word-break:break-all;">' + icons + title + banner + '</div>';
                    }
                },
                {
                    data: "screenshot", title: "ScreenShot", width: "20%",
                    "render": function (data, type, row, meta) {
                        let title = '';
                        let index = 0;
                        for (let i in data) {
                            index++;
                            if (index > 5) {
                                let disable_fofa = $('#checkbox_disable_fofa').is(":checked");
                                title += '<a href=/domain-info?workspace=' + row['workspace'] + '&&domain=' + row['domain'] + '&&disable_fofa=' + disable_fofa + ' target="_blank">' + '<img src="/static/images/more.png" class="img"  style="margin-bottom: 5px;margin-left: 5px;" title="点击查看更多>" /></a>';
                                break;
                            }
                            let thumbnailFile = data[i].replace('.png', '_thumbnail.png');
                            let imgTitle = data[i].replace(".png", "").replace("_", ":");
                            title += '<img src="/webfiles/' + row['workspace_guid'] + '/screenshot/' + row['domain'] + '/' + thumbnailFile + '" class="img"  style="margin-bottom: 5px;margin-left: 5px;" title="' + imgTitle + '" onclick="show_bigpic(\'/webfiles/' + row['workspace_guid'] + '/screenshot/' + row['domain'] + '/' + data[i] + '\')"/>'
                        }
                        return '<div style="width:100%;white-space:normal;word-wrap:break-word;word-break:break-all;">' + title + '</div>';
                    }
                },
            ],
            infoCallback: function (settings, start, end, max, total, pre) {
                return "共<b>" + total + "</b>条记录，当前显示" + start + "到" + end + "记录";
            },
            drawCallback: function (setting) {
                if ($('#checkbox_select_statistic').is(":checked")) {
                    process_statistic_data_domain(setting)
                    process_statistic_data_ip(setting);
                    process_statistic_data_port(setting);
                    process_statistic_data_icon(setting);
                    process_statistic_data_title(setting);
                    process_statistic_data_banner(setting);
                    $('#div_show_statistic').attr("style", "display:block");
                } else {
                    $('#div_show_statistic').attr("style", "display:none");
                }
                const _this = $(this);
                const tableId = _this.attr('id');
                const pageDiv = $('#' + tableId + '_paginate');
                pageDiv.append(
                    '<a class="paginate_button" href="#divTop">UP</a>' +
                    '<i class="fa fa-arrow-circle-o-right fa-lg" aria-hidden="true"></i><input id="' + tableId + '_gotoPage" type="text" style="height:20px;line-height:20px;width:40px;"/>' +
                    '<a class="paginate_button" aria-controls="' + tableId + '" tabindex="0" id="' + tableId + '_goto">GO</a>')
                $('#' + tableId + '_goto').click(function (obj) {
                    let page = $('#' + tableId + '_gotoPage').val();
                    const thisDataTable = $('#' + tableId).DataTable();
                    const pageInfo = thisDataTable.page.info();
                    if (isNaN(page)) {
                        $('#' + tableId + '_gotoPage').val('');
                    } else {
                        const maxPage = pageInfo.pages;
                        page = Number(page) - 1;
                        if (page < 0) {
                            page = 0;
                        } else if (page >= maxPage) {
                            page = maxPage - 1;
                        }
                        $('#' + tableId + '_gotoPage').val(page + 1);
                        thisDataTable.page(page).draw('page');
                    }
                })
            }
        }
    );//end datatable
});

function get_export_options() {
    let url = "";
    url += 'org_id=' + encodeURI($('#select_org_id_search').val());
    url += '&ip_address=' + encodeURI($('#ip_address').val());
    url += '&domain_address=' + encodeURI($('#domain_address').val());
    url += '&color_tag=' + encodeURI($('#select_color_tag').val());
    url += '&memo_content=' + encodeURI($('#memo_content').val());
    url += '&date_delta=' + encodeURI($('#date_delta').val());
    url += '&disable_fofa=' + encodeURI($('#checkbox_disable_fofa').is(":checked"));
    url += "&select_order_by_date=" + encodeURI($('#checkbox_select_order_by_date').is(":checked"));
    url += "&content=" + encodeURI($('#content').val());
    url += "&create_date_delta=" + encodeURI($('#create_date_delta').val());
    url += "&domain_http=" + encodeURI($('#http_content').val());

    return url;
}

function load_domainscan_config() {
    $.post("/config-list", function (data) {
        $('#checkbox_subfinder').prop("checked", data['subfinder']);
        $('#checkbox_subdomainbrute').prop("checked", data['subdomainbrute']);
        $('#checkbox_crawler').prop("checked", data['subdomaincrawler']);
        //onlineapi
        $('#checkbox_fofasearch').prop("checked", data['fofa']);
        $('#checkbox_huntersearch').prop("checked", data['hunter']);
        $('#checkbox_quakesearch').prop("checked", data['quake']);
        $('#checkbox_icpquery').prop("checked", data['icp']);
        $('#checkbox_whoisquery').prop("checked", data['whois']);
        $('#checkbox_ignorecdn_outofchina').prop("checked", data['ignorecdn']);

        $('#checkbox_portscan').prop("checked", data['portscan']);
        //fingerprint
        $('#checkbox_httpx').prop("checked", data['httpx']);
        $('#checkbox_fingerprinthub').prop("checked", data['fingerprinthub']);
        $('#checkbox_screenshot').prop("checked", data['screenshot']);
        $('#checkbox_iconhash').prop("checked", data['iconhash']);

    });
}

function process_statistic_data_domain(setting) {
    let obj_map = new Map()
    for (const data of setting.json.data) {
        if (obj_map.has(data.fld_domain)) {
            obj_map.set(data.fld_domain, obj_map.get(data.fld_domain) + 1)
        } else {
            obj_map.set(data.fld_domain, 1)
        }
    }
    $('#statistic_domain').html(get_result_output(obj_map));
}

function process_statistic_data_ip(setting) {
    let obj_map = new Map()
    for (const data of setting.json.data) {
        for (const ip of data.ip) {
            if (isIpv4(ip)) {
                let ip_Nums = ip.split(".")
                if ((ip_Nums.length) === 4) {
                    const ip_C = ip_Nums[0] + "." + ip_Nums[1] + "." + ip_Nums[2] + ".0/24";
                    if (obj_map.has(ip_C)) {
                        obj_map.set(ip_C, obj_map.get(ip_C) + 1)
                    } else {
                        obj_map.set(ip_C, 1)
                    }
                }
            } else if (isIpv6(ip)) {
                const ip_C = getIPv6CSubnet(ip)
                if (obj_map.has(ip_C)) {
                    obj_map.set(ip_C, obj_map.get(ip_C) + 1)
                } else {
                    obj_map.set(ip_C, 1)
                }
            }
        }
    }
    $('#statistic_ip').html(get_result_output(obj_map, 42));
}

function process_statistic_data_port(setting) {
    let obj_map = new Map()
    for (const data of setting.json.data) {
        for (const port of data.port) {
            if (obj_map.has(port)) {
                obj_map.set(port, obj_map.get(port) + 1)
            } else {
                obj_map.set(port, 1)
            }
        }
    }
    $('#statistic_port').html(get_result_output(obj_map));
}

function process_statistic_data_icon(setting) {
    let obj_map = new Map()
    for (const data of setting.json.data) {
        for (let i in data.iconimage) {
            let icon = '<img src=/webfiles/' + data.workspace_guid + '/iconimage/' + data.iconimage[i] + ' width="24px" height="24px"/>';
            if (obj_map.has(icon)) {
                obj_map.set(icon, obj_map.get(icon) + 1)
            } else {
                obj_map.set(icon, 1)
            }
        }
    }
    $('#statistic_icon').html(get_result_output(obj_map, 0));
}


function process_statistic_data_title(setting) {
    let obj_map = new Map()

    for (const data of setting.json.data) {
        for (let title of Object.keys(data['title'])) {
            if (obj_map.has(title)) {
                obj_map.set(title, obj_map.get(title) + data['title'][title])
            } else {
                obj_map.set(title, 1)
            }
        }
    }
    $('#statistic_title').html(get_result_output(obj_map));
}

function process_statistic_data_banner(setting) {
    let obj_map = new Map()

    for (const data of setting.json.data) {
        for (let banner of Object.keys(data['banner'])) {
            if (obj_map.has(banner)) {
                obj_map.set(banner, obj_map.get(banner) + data['banner'][banner])
            } else {
                obj_map.set(banner, 1)
            }
        }
    }
    $('#statistic_banner').html(get_result_output(obj_map));
}