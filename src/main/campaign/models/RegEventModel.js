const {
  runQuery,
  runTransactionQuery,
  selectLastId,
} = require("../../../library/queryHelper");
const sql = require("mssql");
mode = process.env.NODE_ENV || "dev";
const config = require("config").get(mode);

const moment = require("moment");

const mydb = {
  // campaign: config.databaseCore.campaign[0],
  campaign: config.databaseCore.campaign[3],
};
// ผลลัพธ์ result.recordset, จำนวน result.rowsAffected
module.exports = {
  getRegEventList: async (data) => {
    let sqlParams = [
      {
        name: "input_ev_status",
        type: sql.Char(1),
        value: data.ev_status,
      },
    ];

    let where_ev_id = "";
    if (data.ev_id) {
      where_ev_id = " AND ev_id=@input_ev_id ";
      sqlParams.push({
        name: "input_ev_id",
        type: sql.Int,
        value: data.ev_id,
      });
    }

    const result = await runQuery(
      mydb.campaign,
      "SELECT\n" +
        "*\n" +
        "FROM REG_EVENT (nolock) where isnull(ev_status,'') = @input_ev_status " +
        where_ev_id +
        " ORDER BY ev_id DESC",
      sqlParams
    );
    if (data.ev_id) {
      return result.recordset[0];
    } else {
      return result.recordset;
    }
  },
  modifyEvent: async (data) => {
    // let sqlParams = [
    //     {
    //         name:"input_ev_status",
    //         type:sql.Char(1),
    //         value:data.ev_status
    //     }
    // ]
    // let where_ev_id = ""
    // if(data.ev_id){
    //     where_ev_id = " AND ev_id=@input_ev_id "
    //     sqlParams.push({
    //         name:"input_ev_id",
    //         type:sql.Int,
    //         value:data.ev_id
    //     })
    // }
    // const result = await runQuery(
    //     mydb.campaign,
    //     "SELECT\n" +
    //     "*\n" +
    //     "FROM REG_EVENT (nolock) where isnull(ev_status,'') = @input_ev_status "+where_ev_id+" ORDER BY ev_id ASC",
    //     sqlParams
    // )
    // if(data.ev_id) {
    //     return result.recordset[0]
    // }else{
    //     return result.recordset
    // }
  },
  createEvent: async (data) => {
    let nowDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await runTransactionQuery(mydb.campaign, [
      {
        query: `insert into RTM_TAG (tag_group_id	 	 ,tag_name	 ,tag_is_active	 ,tag_create_by	 ,tag_create_date)
                        values (@input_0_tag_group_id	 	 ,@input_0_tag_name	 ,@input_0_tag_is_active	 ,@input_0_tag_create_by	 ,@input_0_tag_create_date)`,
        sqlParams: [
          {
            name: "input_0_tag_group_id",
            type: sql.Int,
            value: 6, // event taggroupid = 6
          },
          {
            name: "input_0_tag_name",
            type: sql.NVarChar(255),
            value: data.ev_name,
          },
          {
            name: "input_0_tag_is_active",
            type: sql.VarChar(50),
            value: data.ev_status,
          },
          {
            name: "input_0_tag_create_by",
            type: sql.VarChar(50),
            value: data.ev_created,
          },
          {
            name: "input_0_tag_create_date",
            type: sql.VarChar(25),
            value: nowDateTime,
          },
        ],
      },
      {
        query: `insert into REG_EVENT (tag_id, ev_name, ev_status, ev_note, ev_start, ev_end, ev_created, ev_create_date, ev_short_url)
                        values (@input_1_tag_id,  @input_1_ev_name,  @input_1_ev_status,  @input_1_ev_note,  @input_1_ev_start,  @input_1_ev_end,  @input_1_ev_created,  @input_1_ev_create_date,  @input_1_ev_short_url) ; SELECT SCOPE_IDENTITY() AS id;` ,
        sqlParams: [
          {
            name: "input_1_tag_id",
            type: sql.Int,
            value: {
              fnCall: {
                fnName: "selectLastRunno",
                fnParams: {
                  db_name: mydb.campaign,
                  table: "RTM_TAG",
                  col: "tag_id",
                },
              },
            },
          },

          {
            name: "input_1_ev_name",
            type: sql.NVarChar(255),
            value: data.ev_name,
          },
          {
            name: "input_1_ev_status",
            type: sql.VarChar(1),
            value: data.ev_status,
          },
          {
            name: "input_1_ev_note",
            type: sql.NText(50),
            value: data.ev_note,
          },
          {
            name: "input_1_ev_start",
            type: sql.VarChar(25),
            value: data.ev_start,
          },
          {
            name: "input_1_ev_end",
            type: sql.VarChar(25),
            value: data.ev_end,
          },
          {
            name: "input_1_ev_created",
            type: sql.VarChar(50),
            value: data.ev_created,
          },
          {
            name: "input_1_ev_create_date",
            type: sql.VarChar(25),
            value: nowDateTime,
          },
          {
            name: "input_1_ev_short_url",
            type: sql.NVarChar(255),
            value: data.ev_short_url,
          },
        ],
      },
    ]);

    return result;
  },
  updateEvent: async (data) => {
    let nowDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await runTransactionQuery(mydb.campaign, [
      {
        query: `UPDATE rtm_tag                     
                    SET  
                         rtm_tag.tag_name = @input_0_tag_name	 
                        ,rtm_tag.tag_is_active = @input_0_tag_is_active
                        ,rtm_tag.tag_update_by = @input_0_tag_update_by
                        ,rtm_tag.tag_update_date = @input_0_tag_update_date
                    FROM RTM_TAG rtm_tag
                    INNER JOIN REG_EVENT reg_event ON reg_event.tag_id = rtm_tag.tag_id
                    WHERE 
                        reg_event.ev_id = @input_0_ev_id
                    `,
        sqlParams: [
          {
            name: "input_0_ev_id",
            type: sql.Int,
            value: data.ev_id,
          },
          {
            name: "input_0_tag_name",
            type: sql.NVarChar(255),
            value: data.ev_name,
          },
          {
            name: "input_0_tag_is_active",
            type: sql.VarChar(50),
            value: data.ev_status,
          },
          {
            name: "input_0_tag_update_by",
            type: sql.VarChar(50),
            value: data.ev_created,
          },
          {
            name: "input_0_tag_update_date",
            type: sql.VarChar(25),
            value: nowDateTime,
          },
        ],
      },
      {
        query: `UPDATE REG_EVENT 
                    SET 
                          ev_name = @input_1_ev_name
                        , ev_status = @input_1_ev_status
                        , ev_note = @input_1_ev_note
                        , ev_start = @input_1_ev_start
                        , ev_end = @input_1_ev_end
                        , ev_updated = @input_1_ev_updated
                        , ev_update_date = @input_1_ev_update_date
                        , ev_short_url = @input_1_ev_short_url
                    WHERE
                        ev_id = @input_1_ev_id
                    `,
        sqlParams: [
          {
            name: "input_1_ev_id",
            type: sql.Int,
            value: data.ev_id,
          },
          {
            name: "input_1_ev_name",
            type: sql.NVarChar(255),
            value: data.ev_name,
          },
          {
            name: "input_1_ev_status",
            type: sql.VarChar(1),
            value: data.ev_status,
          },
          {
            name: "input_1_ev_note",
            type: sql.NText(50),
            value: data.ev_note,
          },
          {
            name: "input_1_ev_start",
            type: sql.VarChar(25),
            value: data.ev_start,
          },
          {
            name: "input_1_ev_end",
            type: sql.VarChar(25),
            value: data.ev_end,
          },
          {
            name: "input_1_ev_updated",
            type: sql.VarChar(50),
            value: data.ev_created,
          },
          {
            name: "input_1_ev_update_date",
            type: sql.VarChar(25),
            value: nowDateTime,
          },
          {
            name: "input_1_ev_short_url",
            type: sql.NVarChar(255),
            value: data.ev_short_url,
          },
        ],
      },
    ]);

    return result;
  },
  getProjectList: async () => {
    const result = await runQuery(
      mydb.campaign,
      `
        SELECT * FROM RTM_PROJECTS (nolock)
        `
    );
    return result.recordset;
  },
  createProject: async (data) => {
    let nowDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await runQuery(mydb.campaign,       
        `insert into REG_EVENT_PROJECT (pj_code, ev_id, qj_code, price_start, reg_title, reg_header, reg_sub_header, mkt_campaign, mkt_campaign_detail, fb_head_script, fb_body_noscript, gg_head_import_script, gg_head_script, gg_body_noscript, short_url)
                      values (@input_0_pj_code, @input_0_ev_id, @input_0_qj_code, @input_0_price_start, @input_0_reg_title, @input_0_reg_header, @input_0_reg_sub_header, @input_0_mkt_campaign, @input_0_mkt_campaign_detail, @input_0_fb_head_script, @input_0_fb_body_noscript, @input_0_gg_head_import_script, @input_0_gg_head_script, @input_0_gg_body_noscript, @input_0_short_url) `  + selectLastId,
        [
          {
            name: "input_0_pj_code",
            type: sql.NVarChar(10),
            value: data.pj_code,
          },
          {
            name: "input_0_ev_id",
            type: sql.Int(4),
            value: data.ev_id,
          },
          {
            name: "input_0_qj_code",
            type: sql.NVarChar(10),
            value: data.qj_code,
          },
          {
            name: "input_0_price_start",
            type: sql.Decimal(18,3),
            value: data.price_start,
          },
          {
            name: "input_0_reg_title",
            type: sql.NVarChar(255),
            value: data.reg_title,
          },
          {
            name: "input_0_reg_header",
            type: sql.NVarChar(255),
            value: data.reg_header,
          },
          {
            name: "input_0_reg_sub_header",
            type: sql.NVarChar(255),
            value: data.reg_sub_header,
          },
          {
            name: "input_0_mkt_campaign",
            type: sql.NVarChar(255),
            value: data.mkt_campaign,
          },
          {
            name: "input_0_mkt_campaign_detail",
            type: sql.NText(16),
            value: data.mkt_campaign_detail,
          },
          { name: "input_0_fb_head_script", type: sql.NText(16), value: data.fb_head_script },
          {
            name: "input_0_fb_body_noscript",
            type: sql.NText(16),
            value: data.fb_body_noscript,
          },
          {
            name: "input_0_gg_head_import_script",
            type: sql.NText(16),
            value: data.gg_head_import_script,
          },
          { name: "input_0_gg_head_script", type: sql.NText(16), value: data.gg_head_script },
          {
            name: "input_0_gg_body_noscript",
            type: sql.NText(16),
            value: data.gg_body_noscript,
          },
          { name: "input_0_short_url", type: sql.NVarChar(255), value: data.short_url },
        ],
    );

    return result.recordset[0];
  },
  updateProject: async (data) => {
    let nowDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await runTransactionQuery(mydb.campaign, [
        {
            query: `UPDATE 
            REG_EVENT_PROJECT 
            SET
                pj_code                        =              @input_0_pj_code
            ,ev_id                           =               @input_0_ev_id 
            ,qj_code                       =               @input_0_qj_code 
            ,price_start                    =              @input_0_price_start
            ,reg_title                       =               @input_0_reg_title 
            ,reg_header                   =               @input_0_reg_header 
            ,reg_sub_header            =               @input_0_reg_sub_header 
            ,mkt_campaign              =               @input_0_mkt_campaign 
            ,mkt_campaign_detail     =              @input_0_mkt_campaign_detail
            ,fb_head_script              =              @input_0_fb_head_script
            ,fb_body_noscript          =              @input_0_fb_body_noscript
            ,gg_head_import_script   =              @input_0_gg_head_import_script
            ,gg_head_script              =              @input_0_gg_head_script
            ,gg_body_noscript          =              @input_0_gg_body_noscript
            ,short_url                      =               @input_0_short_url
            WHERE ep_id = @input_0_ep_id  
            `,
            sqlParams: [                
              {
                name: "input_0_ep_id",
                type: sql.Int(4),
                value: data.ep_id,
              },
              {
                name: "input_0_pj_code",
                type: sql.NVarChar(10),
                value: data.pj_code,
              },
              {
                name: "input_0_ev_id",
                type: sql.Int(4),
                value: data.ev_id,
              },
              {
                name: "input_0_qj_code",
                type: sql.NVarChar(10),
                value: data.qj_code,
              },
              {
                name: "input_0_price_start",
                type: sql.Decimal(18,3),
                value: data.price_start,
              },
              {
                name: "input_0_reg_title",
                type: sql.NVarChar(255),
                value: data.reg_title,
              },
              {
                name: "input_0_reg_header",
                type: sql.NVarChar(255),
                value: data.reg_header,
              },
              {
                name: "input_0_reg_sub_header",
                type: sql.NVarChar(255),
                value: data.reg_sub_header,
              },
              {
                name: "input_0_mkt_campaign",
                type: sql.NVarChar(255),
                value: data.mkt_campaign,
              },
              {
                name: "input_0_mkt_campaign_detail",
                type: sql.NText(16),
                value: data.mkt_campaign_detail,
              },
              { name: "input_0_fb_head_script", type: sql.NText(16), value: data.fb_head_script },
              {
                name: "input_0_fb_body_noscript",
                type: sql.NText(16),
                value: data.fb_body_noscript,
              },
              {
                name: "input_0_gg_head_import_script",
                type: sql.NText(16),
                value: data.gg_head_import_script,
              },
              { name: "input_0_gg_head_script", type: sql.NText(16), value: data.gg_head_script },
              {
                name: "input_0_gg_body_noscript",
                type: sql.NText(16),
                value: data.gg_body_noscript,
              },
              { name: "input_0_short_url", type: sql.NVarChar(255), value: data.short_url },
            ],
          },
    //   {
    //     query: `UPDATE REG_EVENT 
    //               SET 
    //                     ev_name = @input_1_ev_name
    //                   , ev_status = @input_1_ev_status
    //                   , ev_note = @input_1_ev_note
    //                   , ev_start = @input_1_ev_start
    //                   , ev_end = @input_1_ev_end
    //                   , ev_updated = @input_1_ev_updated
    //                   , ev_update_date = @input_1_ev_update_date
    //               WHERE
    //                   ev_id = @input_1_ev_id
    //               `,
    //     sqlParams: [
    //       {
    //         name: "input_1_ev_id",
    //         type: sql.Int,
    //         value: data.ev_id,
    //       },
    //       {
    //         name: "input_1_ev_name",
    //         type: sql.NVarChar(255),
    //         value: data.ev_name,
    //       },
    //       {
    //         name: "input_1_ev_status",
    //         type: sql.VarChar(1),
    //         value: data.ev_status,
    //       },
    //       {
    //         name: "input_1_ev_note",
    //         type: sql.NText(50),
    //         value: data.ev_note,
    //       },
    //       {
    //         name: "input_1_ev_start",
    //         type: sql.VarChar(25),
    //         value: data.ev_start,
    //       },
    //       {
    //         name: "input_1_ev_end",
    //         type: sql.VarChar(25),
    //         value: data.ev_end,
    //       },
    //       {
    //         name: "input_1_ev_updated",
    //         type: sql.VarChar(50),
    //         value: data.ev_created,
    //       },
    //       {
    //         name: "input_1_ev_update_date",
    //         type: sql.VarChar(25),
    //         value: nowDateTime,
    //       },
    //     ],
    //   },
    ]);

    return result;
  },
  getEventProjectList: async (data) => {
    let sqlParams = [];

    let where_ep_id = "";
    if (data.ep_id) {
      where_ep_id = " AND ep.ep_id=@input_ep_id ";
      sqlParams.push({
        name: "input_ep_id",
        type: sql.Int,
        value: data.ep_id,
      });
    }

      sqlParams.push({
        name: "input_ev_id",
        type: sql.Int,
        value: data.ev_id,
      });

    const result = await runQuery(
      mydb.campaign,
      "SELECT\n" +
        "ep.*\n" +
        ",ISNULL(p.project_name_th , ep.pj_code) AS project_name_th \n" +
        ",ISNULL(p.project_id , 0) AS project_id \n" +
        "FROM REG_EVENT_PROJECT (nolock) ep " +
        "LEFT JOIN RTM_PROJECTS (nolock) p ON p.project_code = ep.pj_code " +
        " where ep.ev_id = @input_ev_id  " + 
        where_ep_id +
        " ORDER BY ep.ep_id ASC",
      sqlParams
    );
    if (data.ep_id) {
      return result.recordset[0];
    } else {
      return result.recordset;
    }
  },
  createImageEventProject: async (data) => {
    let nowDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await runTransactionQuery(mydb.campaign, [
      {
        query: `insert into RTM_BANNER (
            banner_name
            ,banner_source_url
            ,banner_active
            ,create_by
            ,create_date
            ,banner_sort
        )
        values (
            @input_0_banner_name
            ,@input_0_banner_source_url
            ,@input_0_banner_active
            ,@input_0_create_by
            ,@input_0_create_date
            ,@input_0_banner_sort
        )`,
        sqlParams: [
          {
            name: "input_0_banner_name",
            type: sql.NVarChar(255),
            value: data.data_upload.res[0],
          },
          {
            name: "input_0_banner_source_url",
            type: sql.NVarChar(522),
            value: data.data_upload.url,
          },
          {
            name: "input_0_banner_active",
            type: sql.NVarChar(1),
            value: "Y",
          },
          {
            name: "input_0_create_by",
            type: sql.NVarChar(50),
            value: data.event_form.ev_created,
          },
          {
            name: "input_0_create_date",
            type: sql.VarChar(25),
            value: nowDateTime,
          },
          {
            name: "input_0_banner_sort",
            type: sql.Decimal(18, 2),
            value: data.banner_sort,
          },
        ],
      },
      {
        query: `insert into RTM_BANNER_TAGS (
            banner_id
            ,tag_id
            ,banner_tag_active
            ,create_by
            ,create_date
        )
        values (
            @input_1_banner_id
            ,@input_1_tag_id
            ,@input_1_banner_tag_active
            ,@input_1_create_by
            ,@input_1_create_date
        )`,
        sqlParams: [
          {
            name: "input_1_banner_id",
            type: sql.NVarChar(255),
            value: {
                fnCall: {
                    fnName: "selectLastRunno",
                    fnParams: {
                      db_name: mydb.campaign,
                      table: "RTM_BANNER",
                      col: "banner_id",
                    },
                  },
            }
          },
          {
            name: "input_1_tag_id",
            type: sql.Int,
            value: data.event_form.tag_id,
          },
          {
            name: "input_1_banner_tag_active",
            type: sql.NVarChar(1),
            value: "Y",
          },
          {
            name: "input_1_create_by",
            type: sql.NVarChar(50),
            value: data.event_form.ev_created,
          },
          {
            name: "input_1_create_date",
            type: sql.VarChar(25),
            value: nowDateTime,
          },
        ],
      },
      {
        query: `insert into RTM_PROJECT_BANNER_TAGS (
            banner_tag_id
            ,project_id
        )
        SELECT 
        @input_2_banner_tag_id AS banner_tag_id
        ,(SELECT TOP 1 project_id FROM RTM_PROJECTS (nolock) WHERE project_code = @input_2_project_code) AS project_id
        `,
        sqlParams: [
          {
            name: "input_2_banner_tag_id",
            type: sql.NVarChar(255),
            value: {
                fnCall: {
                    fnName: "selectLastRunno",
                    fnParams: {
                      db_name: mydb.campaign,
                      table: "RTM_BANNER_TAGS",
                      col: "banner_tag_id",
                    },
                  },
            }
          },
          {
            name: "input_2_project_code",
            type: sql.NVarChar(50),
            value: data.project_form.pj_code,
          },
        ],
      },
    ]);

    return result;
  },
  
  getEventProjectImageList: async (data) => {
    const result = await runQuery(
      mydb.campaign,
      `

      SELECT
      b.banner_id
      ,b.banner_name
      ,b.banner_source_url
      ,b.banner_click_url
      ,b.banner_desc
      ,b.banner_exp_date
      ,b.banner_active
      ,b.create_by
      ,b.create_date
      ,b.update_by
      ,b.update_date
      ,ISNULL(b.banner_sort, ROW_NUMBER() OVER (ORDER BY b.banner_id)) AS banner_sort
        FROM 
        REG_EVENT ev
        INNER JOIN REG_EVENT_PROJECT (nolock) ep ON ev.ev_id = ep.ev_id
        INNER JOIN RTM_PROJECTS  (nolock) pj ON pj.project_code = ep.pj_code
        INNER JOIN RTM_BANNER_TAGS (nolock) bt ON bt.tag_id = ev.tag_id
        INNER JOIN RTM_PROJECT_BANNER_TAGS pbt ON pbt.project_id = pj.project_id AND pbt.banner_tag_id = bt.banner_tag_id
        INNER JOIN RTM_BANNER (nolock) b ON b.banner_id = bt.banner_id
        WHERE 
        ev.ev_id = @input_ev_id
        AND ep.ep_id = @input_ep_id
        AND b.banner_active = 'Y' 
        ORDER BY ISNULL(b.banner_sort, ROW_NUMBER() OVER (ORDER BY b.banner_id))
        `,
      [
            {
                name: "input_ev_id",
                type: sql.Int,
                value: data.event_form.ev_id,
            },
            {
                name: "input_ep_id",
                type: sql.Int,
                value: data.project_form.ep_id,
            }
      ]
    );
    return result.recordset;
  },
  
  setActiveFalseEventProjectImage: async (data) => {
    let nowDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await runQuery(
      mydb.campaign,
      `
      UPDATE banners SET 
      banners.banner_active = 'N'
      ,update_by = @input_update_by
      ,update_date = @input_update_date
      FROM RTM_BANNER banners
      WHERE banners.banner_id = @input_banner_id
        `,
      [
            {
                name: "input_banner_id",
                type: sql.Int,
                value: data.image_data.banner_id,
            },
            {
                name: "input_update_by",
                type: sql.VarChar(50),
                value: data.event_form.ev_created,
            },
            {
                name: "input_update_date",
                type: sql.VarChar(25),
                value: nowDateTime,
            }
      ]
    );
    return result.recordset;
  },
  
  updateProjectImageOrder: async (data) => {
    let nowDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    var result;

    data.project_image_list?.forEach(async el => {
      result = await runQuery(
        mydb.campaign,
        `
        UPDATE banners SET 
        banners.banner_sort = @input_banner_sort
        ,update_by = @input_update_by
        ,update_date = @input_update_date
        FROM RTM_BANNER banners
        WHERE banners.banner_id = @input_banner_id
          `,
        [
              {
                  name: "input_banner_id",
                  type: sql.Int,
                  value: el.banner_id,
              },
              {
                  name: "input_update_by",
                  type: sql.VarChar(50),
                  value: data.event_form.ev_created,
              },
              {
                  name: "input_update_date",
                  type: sql.VarChar(25),
                  value: nowDateTime,
              },
              {
                  name: "input_banner_sort",
                  type: sql.Decimal(18,2),
                  value: el.banner_sort,
              }
        ]
      );
    });

    
    return 1;
  },
};
