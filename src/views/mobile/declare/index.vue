<template>
  <div class="main">
    <div class="main-header">
      <div class="title">维修申报</div>
      <div class="his-list">
        <router-link :to="`${recordPath}${declarerInfo.xh}`">申报记录</router-link>
      </div>
    </div>
    <div class="main-user">
      <div class="avatar">
        <img :src="declarerInfo.head" width="100%" height="100%"/>
      </div>
      <div class="name">{{ declarerInfo.xm }}</div>
      <div class="student-id">{{ declarerInfo.xh }}</div>
      <div class="ewmAddress">
        <span class="ewmAddress-text"> {{ewmAddress}}</span>
      </div>
    </div>
    <div class="main-swiper" v-if="swipeBlistLength">
      <van-swipe :autoplay="5000" :show-indicators="false" indicator-color="#fff">
        <van-swipe-item
          class="swipe-item"
          v-for="(item, index) of swipeBlist"
          :key="index"
          @click="onItemClick(item)"
        >
          <!--<router-link :to="`${detailPath}${item.id}`">-->
          <div class="bid">编号：{{ item.id }}</div>
          <div class="date"><i class="el-icon-time"></i> <span>{{ $moment(item.sbsj).format(format) }}</span></div>
          <div class="category">申报类别：{{ item.bxlb }}</div>
          <div class="state">{{ getState(item.state).text }}</div>
          <div class="indicator">{{ index + 1 }}/{{ swipeBlistLength }}</div>
          <!--</router-link>-->
        </van-swipe-item>
      </van-swipe>
    </div>
    <div class="main-content">
      <div class="title">请填写申报信息
      </div>

      <el-form class="form" ref="ruleForm" :model="submitBxdParams" :rules="rules" label-width="80px"
               label-position="top"
               :show-message="true">
        <el-form-item v-if="bxlbSelect" label="报修类别" prop="bxlb">
<!--          <el-input v-model="submitBxdParams.bxlb" readonly suffix-icon="el-icon-caret-bottom" placeholder="选择报修类别"-->
<!--                    @focus="handleInputFocus('bxlb')">-->
<!--          </el-input>-->
<!--           v-model="submitBxdParams.bxlb"-->
          <el-cascader
            class="cascader-bxlb"
            placeholder="选择报修类别"
            @change="bxlbChange"
            :options="options"
            filterable
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="报修位置" prop="xxdd">
          <el-input v-model="submitBxdParams.xxdd" placeholder="填写具体需要维修的地方(如：左数第二张桌子)"></el-input>
        </el-form-item>
        <el-form-item label="报修内容" prop="bxnr">
          <el-input v-model="submitBxdParams.bxnr" type="textarea" :rows="3" placeholder="填写报修详细内容(如：桌子脚断了)"></el-input>
        </el-form-item>
        <el-form-item label="预约维修" prop="yydesc">

          <el-input v-model="yydateshow" readonly prefix-icon="el-icon-date" placeholder="预约日期，选填"
                    @focus="datepickerShow = true" style="margin-bottom: 10px;"></el-input>
          <i v-if="yydateshow" class="el-icon-circle-close icon-clear-yydate" @click="clearyydateshow"></i>

          <!--  <mt-field v-model="yydate" type="date" placeholder="选择维修日期，选填" disableClear
                      @change="selectHandler"></mt-field>
            <i v-if="yydate" class="el-icon-circle-close icon-clear-yydate" @click="clearyydateshow"></i>
            <span v-if="!yydate" class="placeholder-yydate">选择维修日期，选填</span>
            <span class="showcon-yydate">{{yydateshow}}</span>-->

          <el-input v-model="submitBxdParams.yydesc" type="textarea" :rows="3"
                    placeholder="具体预约时间（模糊时间，例：周二、三下午或者周末，必填"></el-input>
        </el-form-item>
        <!--<el-form-item label="校区" prop="xq">
          <el-input v-model="submitBxdParams.xq" readonly suffix-icon="el-icon-caret-bottom" placeholder="选择校区"
                    @focus="handleInputFocus('xq')"></el-input>
        </el-form-item>-->
        <el-form-item label="手机号码" prop="sbrsj">
          <el-input v-model="submitBxdParams.sbrsj" type="tel" placeholder="填写本人手机号码"></el-input>
        </el-form-item>
        <el-form-item label="相关图片" prop="tp" class="tp-form-item">
          <div class="label" slot="label">上传资料，请选择
            <van-dropdown-menu>
              <van-dropdown-item v-model="submitType" @change="onSubmitTypeChange" :options="[
                { text: '图片', value: 'img' },
                { text: '视频', value: 'video' }
              ]"/>
            </van-dropdown-menu>
          </div>

          <template v-show="submitType === 'video'">
            <form
              v-show="uploadend === false && submitType === 'video'"
              class="form_video van-uploader__upload"
              id="form_video"
              name="form_video"
              :action="action_video"
              method="post"
              enctype="multipart/form-data"
            >
              <van-icon class="van-uploader__upload-icon" name="photograph"/>
              <span class="van-uploader__upload-text">上传视频</span>
              <input class="file van-uploader__input" id="file" type="file" name="file" accept="video/*"
                     @change="uploadFile"/>
            </form>
            <div v-show="uploadend === true" class="video-player" id="video-player">
              <van-icon class="video-player__close" name="close" @click="uploadFileClear"/>
            </div>
          </template>


          <van-uploader
            v-show="submitType === 'img'"
            v-model="uploadFiles"
            accept="image/*"
            :max-count="3"
            :max-size="10 * 1024 * 1024"
            upload-text="上传图片"
            :before-read="beforeRead"
            :after-read="afterRead"
            @oversize="oversizeFile"
            @delete="deleteFile"
          />

          <p class="tips">若不能上传请更新易班至最新版本</p>
        </el-form-item>

        <el-form-item class="submit-form-item">
          <van-button type="primary" round size="large" :loading="loading" loading-text="提交中"
                      @click.prevent="submitForm('ruleForm')" v-prevent-re-click>{{submitText}}
          </van-button>
        </el-form-item>
        <el-form-item class="reset-form-item">
          <van-button class="reset-button" type="warning" round size="large" plain
                      @click.prevent="resetForm('ruleForm')">重&nbsp;&nbsp;置
          </van-button>
        </el-form-item>
      </el-form>
    </div>

    <!--下拉选项-->
    <van-action-sheet
      v-model="actionSheetShow"
      :actions="actions"
      @select="handleActionsSelect"
    />

    <!--顶部弹出popup-->
    <van-popup
      v-model="popupShow"
      class="van-popup-tip"
      position="top"
    >
      <van-icon name="warning-o" style="margin-right: 6px;"/>
      {{popupText}}
    </van-popup>

    <!--京东日历 暂时不用-->
    <!--<nut-calendar
      :is-visible="calendarShow"
      :default-value="submitBxdParams.yydate"
      :is-auto-back-fill="true"
      @close="switchShow('calendarShow')"
      @choose="setChooseDate"
    >
    </nut-calendar>-->
    <nut-datepicker
      :is-visible="datepickerShow"
      type="date"
      :default-value="yydate"
      :startDate="datepickerStartDate"
      :endDate="datepickerEndDate"
      title="请选择日期"
      @close="switchShow('datepickerShow')"
      @choose="setChooseDate"
    >
    </nut-datepicker>
  </div>
</template>

<script>
  import Vue from "vue";
  import {BxdServlet} from '@/api/BxdServlet'
  import {EwmServlet} from '@/api/EwmServlet'
  import {DictListServlet} from '@/api/Dict'
  import {VideoUpload, DeleteVideo} from "../../../api/VideoUpload"
  import config from '@/config'
  import compress from '@/utils/image-compress'
  import {mapGetters} from 'vuex'
  import {getAuthInfo, getEid} from '../../../utils/cookie'
  import {filterParams} from "../../../utils/common"
  import { preventReClick } from "../../../utils/plugins";

  Vue.use(preventReClick);

  export default {
    name: 'Declare',
    data() {
      return {
        bxlbSelect:true,
        options:[],
        submitType: 'img', // 上传类型，img或video
        action_video: '', // 上传视频时action的地址
        uploadend: false, // 上传视频状态
        // 报修单请求参数
        bxdParams: {
          op: 'sbrbxd', // 调用方法，固定值*
          xh: '', // 学号*
          eid: ''	// 扫码查询
        },
        // 获得二维码 请求参数
        ewmParams: {
          op: 'selEwmById', // 调用方法，固定值*
          ewmId: 0	// 扫码查询
        },
        // 提交报修单参数
        submitBxdParams: {
          op: 'newbxdbysbr', // 调用方法，固定值*
          eid: '', // 所扫描的二维码地址
          sbr: '', // 申报人姓名
          sbrsj: '', // 手机号码
          sbrxh: '', // 学号
          xxdd: '', // 详细地点（二维码地址不等于报修的报修位置）
          yysj: '', // 预约时间，如果是公共区域，则此项无法填写，是否公共区域，查询方法五
          yydesc: '', // 同上，日期 + 描述组合，提交时替换字段为yysj
          bxlb: '', // 报修类别，下拉框
          bxnr: '', // 具体哪里坏了
          tp: [], // 图片，传递base64数据，以json格式返回
          sp: '',//视频文件名
          jid: '',//接单人id
          bid: ''//报修单id
        },
        tempVideo: '',//视频base64格式，临时存放
        tempVideoFile: '',//视频文件
        current: 0, // 轮播图序列
        declarerInfo: {}, // 保存用户信息 { xm: "???", xh: "212016528", head: "http://img02.fs.yiban.cn/6615683/avatar/user/200" }
        recordPath: config.declareRecordPath,
        detailPath: config.declareDetailsPath,
        icons: config.icons, // 图标路径
        rules: {
          xxdd: {required: true, message: '请选择报修位置', trigger: 'change'},
          bxlb: {required: true, message: '请选择报修类别', trigger: 'change'},
          bxnr: {required: true, message: '请填写报修内容', trigger: 'change'},
          yydesc: {required: true, message: '请填写预约维修时间', trigger: 'change'},
          sbrsj: [
            {required: true, message: '请填写手机号码', trigger: ['blur', 'change']},
            {pattern: /^((0\d{2,3}-\d{7,8})|(1[345789]\d{9}))$/, message: '手机号码格式不正确', trigger: 'blur'}
          ]
        },
        submitText: '我要申报',
        type: '', // input字段
        actionSheetShow: false, // 底部抽屉显隐
        popupShow: false, // 顶部提示显隐
        calendarShow: false, // 日历
        datepickerShow: false, // 时间选择器
        datepickerFormat: 'YYYY-MM-DD', // 时间选择器的值格式
        popupText: '', // 顶部提示文案
        actions: [],
        loading: false, // 提交加载状态
        yydateshow: '',
        yydate: '', // 维修预约日期
        yyday: '', // 星期几
        format: 'YYYY/MM/DD HH:mm', // 轮播申报单显示的时间格式
        weeks: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        uploadFiles: [],
        uploadFilesCache: [],
        toast: null,
        headimg: require('@/assets/head.png'),
        ewmAddress: ''
      }
    },
    created() {
      let authInfo = getAuthInfo()
      if (authInfo.sf != 1) {
        this.$router.push('/no-permission')
      }
      // 没有eid，跳转首页重定向
      if (!authInfo.eid) {
        this.$router.push('/')
      }

      //暂时用不到
      this.action_video = this.config.api + '/Fileload'

      const {xm, xh, head} = authInfo
      this.declarerInfo = {
        xm: xm,
        xh: xh,
        head: head || this.headimg,
      }

      this.submitBxdParams.sbr = xm // 申报人姓名
      this.submitBxdParams.sbrxh = xh // 申报人学号
      this.submitBxdParams.eid = authInfo.eid // 区域id
      if (!this.hasBlist) {
        this.fetchData(xh)
      }

      this.recordPath = this.recordPath.replace(':id', '')
      this.detailPath = this.detailPath.replace(':id', '')
      this.inityydate()
      this.initDict()
      let rework = sessionStorage.getItem('rework');
      if (rework === 'toRework'){
        this.bxlbSelect = false;
      }
      this.fetchEwmDetail();
    },
    computed: {
      ...mapGetters(['blist', 'config']),
      hasBlist() {
        return this.blist.length
      },
      swipeBlist() { // 未派单、维修中
        return this.blist.filter(item => {
          return item.state === 0 || item.state === 1
        })
      },
      swipeBlistLength() {
        return this.swipeBlist.length
      },
      datepickerStartDate() {
        return this.$moment().subtract(10, 'year').format(this.datepickerFormat)
      },
      datepickerEndDate() {
        return this.$moment().add(10, 'year').format(this.datepickerFormat)
      }
    },
    watch: {
      yydateshow() {
        this.submitBxdParams.yysj = this.yydateshow ? this.yydateshow + ' ' + this.submitBxdParams.yydesc : this.submitBxdParams.yydesc
      },
      'submitBxdParams.yydesc'() {
        this.submitBxdParams.yysj = this.yydateshow ? this.yydateshow + ' ' + this.submitBxdParams.yydesc : this.submitBxdParams.yydesc
      }
    },
    methods: {
      //初始化报修类别
      initDict(){
        DictListServlet().then(response => {
          this.options = response.obj;
        }).catch(() => {
          this.$message.error('查询报修类别出错')
        })
      },
      /**
       * 根据学号获取报修单
       * @param info
       */
      async fetchData(xh) {
        this.bxdParams['xh'] = xh
        this.bxdParams['eid'] = getEid()
        let params = filterParams(this.bxdParams)
        await BxdServlet(params).then(response => {
          if (response.obj.blist) {
            this.$store.commit('sbr/SET_BLIST', response.obj.blist)
          }
        }).catch(() => {
          this.$message.error('查询出错')
        })
      },
      /**
       * 根据eid获取二维码详细信息
       */
      async fetchEwmDetail() {
        this.ewmParams['ewmId'] = getEid();
        let params = filterParams(this.ewmParams)
        await EwmServlet(params).then(response => {
          this.ewmAddress = response.obj.ewmDetail.xxdd
        }).catch(() => {
          this.$message.error('查询出错ewm')
        })
      },

      switchShow(param) {
        this[`${param}`] = !this[`${param}`]
      },
      setChooseDate(param) {
        this.yydate = param[3]
        this.yyday = param[4]
        this.yydateshow = `${this.yydate} ${this.yyday}`
      },
      handleInputFocus(type) {
        this.actionSheetShow = true
        this.type = type
        this.getActions(type)
      },
      handleActionsSelect(item) {
        this.actionSheetShow = false
        this.submitBxdParams[this.type] = item.name
      },
      bxlbChange(currentVal){
        if (currentVal.length == 0) {
          this.submitBxdParams.bxlb = '';
        } else {
          this.submitBxdParams.bxlb = currentVal[0]+'-'+currentVal[1];
        }
      },
      getActions(type) {
        switch (type) {
          case 'xq':
            this.actions = config.campus.map(item => {
              return {name: item.text}
            })
            break
          // case 'bxlb':
          //   this.actions = config.repairCategory.map(item => {
          //     switch (item) {
          //       case 'wywx': item = '物业维修'; break;
          //       case 'sdwx': item = '水电维修'; break;
          //       case 'rswx': item = '热水维修'; break;
          //       case 'jdwx': item = '家电维修'; break;
          //       case 'ktwx': item = '空调维修'; break;
          //       case 'qt': item = '其他'; break;
          //     }
          //     //然后根据这个item，请求后台字典，选择对应的具体维修地点
          //     return {name: item}
          //   })
          //   break
        }
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true
            if (typeof this.submitBxdParams.tp !== "string"){
              this.submitBxdParams.tp = JSON.stringify(this.submitBxdParams.tp)
            }
            delete this.submitBxdParams.yydesc
            if (this.tempVideoFile !== ''){
              this.UploadVideoToFur()
            }else {
              this.SubmitForm()
            }

          } else {
            this.showPopupTip('申报信息未填完哦~')
            return false
          }
        })
      },
      //上传视频到服务器
      UploadVideoToFur(){
        VideoUpload(this.tempVideoFile).then((res) => {
          this.submitBxdParams.sp = res.data.obj
          this.SubmitForm()
        }).catch(() => {
          this.loading = false
          this.submitText = '重新提交'
          this.$toast({
            message: '申报失败，请重试',
            icon: this.icons + 'tip_info@2x.png',
            duration: 1500
          })
        })
      },
      //提交表单，包含视频（文件名）、图片（base64）
      SubmitForm(){
        // 取值时：把获取到的Json字符串转换回对象
        var param = sessionStorage.getItem('param');
        if (param != null){
          param = JSON.parse(param);
          this.submitBxdParams.jid = param.jid
          this.submitBxdParams.bid = param.bid
        }else {
          this.submitBxdParams.jid = ''
          this.submitBxdParams.bid = ''
        }

        if (this.submitBxdParams.jid !== '' && this.submitBxdParams.bid !== '') {
          BxdServlet(this.submitBxdParams).then((res) => {
            this.loading = false
            this.$toast({
              message: '申请返工已提交',
              icon: this.icons + 'icon_suc@2x.png',
              duration: 1500,
              onClose: async () => {
                this.resetForm('ruleForm')
                await this.fetchData(this.submitBxdParams.sbrxh)
                if(res.info == "wjdr"){
                  alert("系统已为您生成报修单！但是当前没有可以接单的接单人了！请尽快电话联系后勤处为您安排接单人！");
                }
                this.$router.push(`${this.recordPath}${this.submitBxdParams.sbrxh}`)
              }
            })
          }).catch(() => {
            this.loading = false
            this.submitText = '重新提交'
            this.$toast({
              message: '申请返工失败，请重试',
              icon: this.icons + 'tip_info@2x.png',
              duration: 1500
            })
          });
        } else {
          BxdServlet(this.submitBxdParams).then((res) => {
            this.loading = false;
            this.$toast({
              message: '申报已提交',
              icon: this.icons + 'icon_suc@2x.png',
              duration: 1500,
              onClose: async () => {
                this.resetForm('ruleForm')
                await this.fetchData(this.submitBxdParams.sbrxh)
                if(res.info == "wjdr"){
                  alert("系统已为您生成报修单！但是当前没有可以接单的接单人了！请尽快电话联系后勤处为您安排接单人！");
                }
                this.$router.push(`${this.recordPath}${this.submitBxdParams.sbrxh}`)
              }
            })
          }).catch(() => {
            this.loading = false
            this.submitText = '重新提交'
            this.$toast({
              message: '申报失败，请重试',
              icon: this.icons + 'tip_info@2x.png',
              duration: 1500
            })
          });
        }
      },
      /**
       * 重置表单
       * 同时需要删除上传文件的缓存记录
       * @param formName 表单名称
       */
      resetForm(formName) {
        this.$refs[formName].resetFields()
        this.clearyydateshow()
        this.deleteAllFiles()
        this.uploadend = false
        if (this.SubmitForm.sp !== '' && this.SubmitForm.sp !== undefined){
          DeleteVideo(this.submitForm.sp)
        }
      },
      /**
       * 顶部提示，1.2s后自定隐藏
       */
      showPopupTip(text) {
        this.popupShow = true
        this.popupText = text
        setTimeout(() => {
          this.popupShow = false
        }, 1200)
      },
      inityydate() {
        this.yydate = this.$moment().format(this.datepickerFormat)
        this.yyday = this.weeks[this.$moment().day()]
      },
      clearyydateshow() {
        this.yydateshow = ''
      },
      selectHandler() {
        const day = this.$moment(this.yydate, 'YYYY-MM-DD').day() // Number
        this.yyday = this.weeks[day]
      },
      beforeRead() {
        this.toast = this.$toast({
          type: 'loading',
          message: '请稍后',
          duration: 2000
        })
        return true
      },
      upLoadFile(file) {
        compress(file.file, {
          type: 'file',
          compress: {
            width: 1600,
            height: 1600,
            quality: 0.5
          }
        }, (_file, _dataURL) => {
          this.toast.clear()
          if (!_dataURL) { // 压缩出错，无_dataURL返回
            this.$notify({
              message: '压缩出错，请重新上传',
              className: 'my-notify error'
            })
          } else {
            this.uploadFiles = JSON.parse(JSON.stringify(this.uploadFilesCache))
            this.uploadFiles.push({
              content: _dataURL,
              file: _file
            })
            this.uploadFilesCache = JSON.parse(JSON.stringify(this.uploadFiles))
            this.submitBxdParams.tp = this.setParamsTp()
          }
        })
      },
      afterRead(file) {
        if (file instanceof Array) {
          file.forEach((item) => {
            this.upLoadFile(item)
          })
        } else {
          this.upLoadFile(file)
        }
      },
      setParamsTp() {
        return this.uploadFilesCache.map(item => {
          const suffix = /\.[^\.]+$/.exec(item.file.name)
          return {
            base64: item.content,
            hz: suffix[0].replace('.', '')
          }
        })
      },
      oversizeFile() {
        this.toast.clear()
        this.$notify({
          message: '图片大小不能超过10M',
          className: 'my-notify error'
        })
      },
      deleteFile(file) {
        // 过滤名字和id相等的，返回不等的
        this.uploadFilesCache = this.uploadFilesCache.filter(item => item.file.id !== file.file.id && item.file.name !== file.file.name)
        this.submitBxdParams.tp = this.setParamsTp()
      },
      deleteAllFiles() {
        this.uploadFiles = []
        this.uploadFilesCache = []
        this.submitBxdParams.tp = []
        this.tempVideo = ''
        this.tempVideoFile = ''

      },
      processFile(file, next) {
        compress(file, {
          compress: {
            width: 1600,
            height: 1600,
            quality: 0.5
          }
        }, (handlefile) => {
          next(handlefile)
        })
      },
      /**
       * 根据状态值返回当前状态
       * @param state
       * @returns {*}
       */
      getState(state) {
        const item = config.progress && config.progress.filter(item => item.value === state)
        return item && item[0]
      },
      /**
       * 跳转报修单详情
       */
      onItemClick(item) {
        this.$router.push(`${this.detailPath}${item.id}`)
      },
      /**
       * 选择上传类型
       */
      onSubmitTypeChange(val) {
        if (val === 'img') {
          this.uploadend = false
        } else if (val === 'video') {
          if (this.tempVideo !== ""){
            this.uploadend = true
            if (document.getElementsByTagName("video") === null) {
              var video = document.createElement("video");
              video.controls = "controls";
              video.src = this.tempVideo;
              video.preload = 'auto'
              video.width = 300;
              video.height = 200;
              document.getElementById("video-player").appendChild(video);
            }

          }
        }
      },
      /**
       * 上传视频
       */
      uploadFile(e) {
        this.uploadend = true
        let file = e.target.files[0]
        const suffix = /\.[^\.]+$/.exec(file.name)
        var _that = this
        this.tempVideoFile = file
        if (window.FileReader) {
          var fr = new FileReader();
          fr.onloadend = function (e) {
            var video = document.createElement("video");
            video.controls = "controls";
            video.src = e.target.result;
            video.preload = 'auto'
            video.width = 300;
            video.height = 200;
            document.getElementById("video-player").appendChild(video);
            _that.setTemSp(e.target.result);
          };
          fr.readAsDataURL(file);
        }
      },
      setTemSp(base64){
        this.tempVideo = base64;
      },
      /**
       * 清除视频
       */
      uploadFileClear() {
        this.uploadend = false
        this.tempVideoFile = ''
        this.tempVideo = ''
        // if (this.SubmitForm.sp !== ''){
        //   DeleteVideo(this.submitForm.sp)
        // }
        this.$nextTick(() => {
          document.getElementById("file").value = "";
          let all = document.getElementById("video-player");
          all.removeChild(all.childNodes[1]);
        })
      }
    }
  }
</script>

<style lang="scss">
  .form {
    .el-form-item {
      width: 654px;
      /*margin-bottom: 26px;*/
      .el-form-item__label {
        line-height: 64px;
        padding: 0;
      }

      .el-form-item__content {
        .cascader-bxlb{
          width: 100%;
        }
        .el-input__inner {
          background: rgba(244, 246, 248, 1);
          border-color: transparent;
          height: 88px;
          line-height: 88px;
        }

        .el-input__inner:focus {
          border-color: transparent;
        }

        .el-textarea__inner {
          background: rgba(244, 246, 248, 1);
          border-color: transparent;
        }

        .el-input__prefix {
          .el-input__icon {
            line-height: 88px;
          }
        }

        .icon-clear-yydate {
          position: absolute;
          top: 0;
          right: 26px;
          z-index: 100;
          line-height: 88px;
          color: #C0C4CC;
        }

        .placeholder-yydate {
          position: absolute;
          top: 0;
          left: 30px;
          z-index: 100;
          line-height: 88px;
          color: #C0C4CC;
          pointer-events: none;
        }

        .showcon-yydate {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 99;
          width: 100%;
          border-color: transparent;
          height: 88px;
          line-height: 88px;
          -webkit-appearance: none;
          background-color: #f4f6f8;
          border-radius: 4px;
          box-sizing: border-box;
          color: #606266;
          display: inline-block;
          outline: none;
          padding: 0 30px;
          transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
          pointer-events: none;
        }
      }
    }

    .submit-form-item {
      margin: 80px 0 20px 0;
    }

    .tp-form-item {
      .label {
        margin-bottom: 15px;

        .van-dropdown-menu {
          display: inline-block;

          .van-dropdown-menu__bar {
            box-shadow: none;
          }
        }

      }

      .tips {
        font-size: 26px;
        color: #b5b5b5;
      }

      .form_video {

        .van-uploader__upload-icon {
          color: #dcdee0;
          font-size: 48px;
        }

        input.value {
          display: none;
        }
      }

      .video-player {
        width: 100%;
        text-align: center;
        position: relative;

        .video-player__close {
          position: absolute;
          top: -10px;
          right: -10px;
          font-size: 46px;
        }
      }
    }

    .reset-form-item {
      margin: 0 0 40px 0;

      .reset-button {
        border: none;
      }
    }
  }

  .van-uploader__upload-text {
    margin-top: 30px;
    line-height: 8px;
  }

  .van-action-sheet {
    max-height: 70%;
  }

  .van-popup-tip {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f96953;
    font-size: 28px;
    color: #fff;
    height: 100px;
  }

  .mint-field-core {
    border-color: transparent;
    height: 88px;
    line-height: 88px;
    -webkit-appearance: none;
    background-color: #f4f6f8;
    border-radius: 4px;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    outline: none;
    padding: 0 15px;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 100%;
  }

  .cube-upload-file-def > .cubeic-wrong {
    line-height: 32px;
  }

  /*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
  ::-webkit-scrollbar {
    width: 6px;
    height: 8px;
  }

  /* 滚动条的滑轨背景颜色 */
  ::-webkit-scrollbar-track {
    background-color: #fff;
    border-radius: 5px;
  }

  /* 滑块颜色 */
  ::-webkit-scrollbar-thumb {
    background-color: #dedede;
    border-radius: 20px;
  }
</style>
<style lang="scss" scoped>
  .main {
    width: 750px;
    height: 100%;
    background: #fff;
    opacity: 1;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;

    &-user {
      width: 750px;
      height: 152px;
      background-color: #F4F6F8;
      font-family: PingFang SC;
      box-sizing: border-box;
      position: sticky;
      top: -3px;
      z-index: 999;

      .avatar {
        width: 90px;
        height: 90px;
        position: absolute;
        top: 30px;
        left: 48px;
        background: rgba(0, 0, 0, 0);
        border-radius: 50%;
        overflow: hidden;
      }

      .name {
        height: 44px;
        position: absolute;
        top: 30px;
        left: 156px;
        font-size: 30px;
        font-weight: 500;
        line-height: 44px;
        color: rgba(74, 88, 96, 1);
      }

      .ewmAddress {
        position: absolute;
        //position: relative;
        width: 280px;
        height: 80px;
        top: 57px;
        right: 78px;
        font-size: 30px;
        font-weight: 500;
        line-height: 38px;
        color: rgba(74, 88, 96, 1);
        &-text {
          display: flex;
          justify-content: center;
          align-content: center;
        }
      }

      .student-id {
        height: 36px;
        position: absolute;
        top: 80px;
        left: 156px;
        font-size: 26px;
        font-weight: 400;
        line-height: 36px;
        color: rgba(74, 88, 96, 1);
        opacity: 0.5;
      }
    }

    &-header {
      width: 750px;
      height: 162px;
      padding: 20px 0;
      background: #fff;
      box-shadow: 4px 6px 16px rgba(150, 150, 150, 0.2);
      position: relative;
      z-index: 2;

      .title {
        width: 256px;
        height: 90px;
        float: left;
        font-size: 52px;
        font-family: PingFang SC;
        font-weight: bold;
        line-height: 90px;
        color: rgba(74, 88, 96, 1);
        margin: 12px 0 10px 48px;
      }

      .his-list {
        width: 168px;
        height: 44px;
        float: right;
        font-size: 32px;
        font-family: Microsoft YaHei;
        font-weight: 400;
        line-height: 44px;
        cursor: pointer;
        margin: 34px 48px 34px 0;

        a {
          color: rgba(16, 175, 90, 1);
        }
      }
    }

    &-swiper {
      width: 670px;
      height: 288px;
      margin: 34px 40px;
      border-radius: 16px;
      background-color: #10AF5A;
      overflow: hidden;

      .van-swipe {
        height: 100%;
        cursor: pointer;

        .swipe-item {
          background-image: url('http://yiban.glmc.edu.cn/icons/bg_feature@2x.png');
          background-size: cover;

          .bid {
            position: absolute;
            top: 38px;
            left: 38px;
            width: 320px;
            height: 36px;
            font-size: 26px;
            font-family: PingFang SC;
            font-weight: 400;
            line-height: 36px;
            color: rgba(255, 255, 255, 1);
            opacity: 0.5;
            word-break: break-all;
          }

          .date {
            position: absolute;
            top: 38px;
            right: 38px;
            width: auto;
            height: 36px;
            font-size: 26px;
            font-family: PingFang SC;
            font-weight: 400;
            line-height: 36px;
            color: rgba(255, 255, 255, 1);
            opacity: 0.5;
          }

          .category {
            position: absolute;
            top: 100px;
            left: 40px;
            width: 570px;
            height: 50px;
            font-size: 34px;
            font-family: PingFang SC;
            font-weight: bold;
            line-height: 50px;
            color: rgba(255, 255, 255, 1);
            opacity: 1;
            word-break: break-all;
          }

          .state {
            position: absolute;
            bottom: 30px;
            left: 40px;
            width: 176px;
            height: 64px;
            font-size: 28px;
            color: rgba(255, 255, 255, 1);
            background: rgba(6, 113, 56, .8);
            border-radius: 160px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .indicator {
            position: absolute;
            right: 24px;
            bottom: 36px;
            padding: 8px 16px;
            color: #fff;
            font-size: 30px;
            border-radius: 24px;
          }
        }
      }
    }

    &-content {
      width: 750px;

      .title {
        height: 50px;
        font-size: 36px;
        font-family: PingFang SC;
        font-weight: bold;
        line-height: 50px;
        color: rgba(74, 88, 96, 1);
        margin: 24px 0 16px 48px;
      }

      .form {
        margin: 0 48px;
      }
    }
  }
</style>
