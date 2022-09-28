<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :inline="true" :model="queryParams" label-width="68px" size="small">
      <el-form-item label="应用编码" prop="appId">
        <el-input
          v-model="queryParams.appId"
          clearable
          placeholder="请输入应用编码"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否有效" prop="enabled">
        <el-select v-model="queryParams.enabled" clearable placeholder="请选择是否有效">
          <el-option
            v-for="dict in dict.type.sys_enable_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否删除" prop="deleted">
        <el-select v-model="queryParams.deleted" clearable placeholder="请选择是否删除">
          <el-option
            v-for="dict in dict.type.sys_delete_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" size="mini" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['export:app:add']"
          icon="el-icon-plus"
          plain
          size="mini"
          type="primary"
          @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['export:app:edit']"
          :disabled="single"
          icon="el-icon-edit"
          plain
          size="mini"
          type="success"
          @click="handleUpdate"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['export:app:remove']"
          :disabled="multiple"
          icon="el-icon-delete"
          plain
          size="mini"
          type="danger"
          @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['export:app:export']"
          icon="el-icon-download"
          plain
          size="mini"
          type="warning"
          @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="appList" ref="table" :height="tableHeight" border highlight-current-row stripe
              @selection-change="handleSelectionChange">
      <el-table-column align="center" fixed type="selection" width="55"/>
      <el-table-column v-if="false" align="center" label="主鍵" prop="id"/>
      <el-table-column align="center" label="应用编码" fixed prop="appId" width="280px"/>
      <el-table-column align="center" label="应用名称" fixed prop="appName"/>
      <el-table-column align="center" label="备注" prop="remark"/>
      <el-table-column align="center" label="是否有效" prop="enabled">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_enable_status" :value="scope.row.enabled"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否删除" prop="deleted">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_delete_status" :value="scope.row.deleted"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建者" prop="createBy"/>
      <el-table-column align="center" label="创建时间" prop="createTime" width="180px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="更新者" prop="updateBy"/>
      <el-table-column align="center" label="更新时间" prop="updateTime" width="180px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="180px">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['export:app:edit']"
            icon="el-icon-edit"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['export:app:remove']"
            icon="el-icon-delete"
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNum"
      :total="total"
      @pagination="getList"
    />

    <!-- 添加或修改应用信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" append-to-body width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="应用编码" prop="appId">
          <el-input v-model="form.appId" placeholder="请输入应用编码"/>
        </el-form-item>
        <el-form-item label="应用名称" prop="appName">
          <el-input v-model="form.appName" placeholder="请输入应用名称"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listApp, getApp, delApp, addApp, updateApp} from "@/api/export/app";

export default {
  name: "App",
  dicts: ['sys_delete_status', 'sys_enable_status'],
  data() {
    return {
      // tableHeightL
      tableHeight: 440,
      // 按钮loading
      buttonLoading: false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 应用信息表格数据
      appList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appId: undefined,
        enabled: undefined,
        deleted: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [
          {required: true, message: "主鍵不能为空", trigger: "blur"}
        ],
        appId: [
          {required: true, message: "应用编码不能为空", trigger: "blur"}
        ],
        appName: [
          {required: true, message: "应用名称不能为空", trigger: "blur"}
        ],
        remark: [
          {required: true, message: "备注不能为空", trigger: "blur"}
        ],
        enabled: [
          {required: true, message: "是否有效不能为空", trigger: "blur"}
        ],
        deleted: [
          {required: true, message: "是否删除不能为空", trigger: "blur"}
        ],
        createBy: [
          {required: true, message: "创建者不能为空", trigger: "blur"}
        ],
        createTime: [
          {required: true, message: "创建时间不能为空", trigger: "blur"}
        ],
        updateBy: [
          {required: true, message: "更新者不能为空", trigger: "blur"}
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  mounted: function () {
    this.$nextTick(function () {
      if (!this.$refs.table) {
        return
      }
      this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 160;
      // 监听窗口大小变化
      let self = this;
      window.onresize = function () {
        self.tableHeight = window.innerHeight - self.$refs.table.$el.offsetTop - 160;
      }
    })
  },
  methods: {
    /** 查询应用信息列表 */
    getList() {
      this.loading = true;
      listApp(this.queryParams).then(response => {
        this.appList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        appId: undefined,
        appName: undefined,
        appSecret: undefined,
        remark: undefined,
        enabled: 0,
        deleted: 0,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加应用信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.loading = true;
      this.reset();
      const id = row.id || this.ids
      getApp(id).then(response => {
        this.loading = false;
        this.form = response.data;
        this.open = true;
        this.title = "修改应用信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.buttonLoading = true;
          if (this.form.id != null) {
            updateApp(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).finally(() => {
              this.buttonLoading = false;
            });
          } else {
            addApp(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            }).finally(() => {
              this.buttonLoading = false;
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除应用信息编号为"' + ids + '"的数据项？').then(() => {
        this.loading = true;
        return delApp(ids);
      }).then(() => {
        this.loading = false;
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      }).finally(() => {
        this.loading = false;
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('export/app/export', {
        ...this.queryParams
      }, `app_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
