<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务主键" prop="taskId">
        <el-input
          v-model="queryParams.taskId"
          placeholder="请输入任务主键"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="请求方法" prop="method">
        <el-select v-model="queryParams.method" placeholder="请选择请求方法" clearable>
          <el-option
            v-for="dict in dict.type.export_request_ways"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否删除" prop="deleted">
        <el-select v-model="queryParams.deleted" placeholder="请选择是否删除" clearable>
          <el-option
            v-for="dict in dict.type.sys_delete_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['export:taskDetail:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['export:taskDetail:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['export:taskDetail:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['export:taskDetail:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" ref="table" :height="tableHeight" stripe border highlight-current-row :data="taskDetailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" fixed width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" v-if="false"/>
      <el-table-column label="任务主键" align="center" prop="taskId" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="请求方法" align="center" prop="method">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.export_request_ways" :value="scope.row.method"/>
        </template>
      </el-table-column>
      <el-table-column label="基本参数" align="center" prop="param" width="420px" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="是否有效" align="center" prop="enabled">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_enable_status" :value="scope.row.enabled"/>
        </template>
      </el-table-column>
      <el-table-column label="是否删除" align="center" prop="deleted">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_delete_status" :value="scope.row.deleted"/>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" width="180px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['export:taskDetail:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['export:taskDetail:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改任务明细对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="任务主键" prop="taskId">
          <el-input v-model="form.taskId" placeholder="请输入任务主键" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-select v-model="form.method" placeholder="请选择请求方法">
            <el-option
              v-for="dict in dict.type.export_request_ways"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="基本参数" prop="param">
          <el-input v-model="form.param" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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
import { listTaskDetail, getTaskDetail, delTaskDetail, addTaskDetail, updateTaskDetail } from "@/api/export/taskDetail";

export default {
  name: "TaskDetail",
  dicts: ['sys_delete_status', 'sys_enable_status', 'export_request_ways'],
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
      // 任务明细表格数据
      taskDetailList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskId: undefined,
        method: undefined,
        deleted: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [
          { required: true, message: "主键不能为空", trigger: "blur" }
        ],
        taskId: [
          { required: true, message: "任务主键不能为空", trigger: "blur" }
        ],
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        method: [
          { required: true, message: "请求方法不能为空", trigger: "change" }
        ],
        param: [
          { required: true, message: "基本参数不能为空", trigger: "blur" }
        ],
        remark: [
          { required: true, message: "备注不能为空", trigger: "blur" }
        ],
        enabled: [
          { required: true, message: "是否有效不能为空", trigger: "blur" }
        ],
        deleted: [
          { required: true, message: "是否删除不能为空", trigger: "blur" }
        ],
        createBy: [
          { required: true, message: "创建者不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
        updateBy: [
          { required: true, message: "更新者不能为空", trigger: "blur" }
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
      this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop -
        this.$refs.queryForm.$el.offsetTop;
      // 监听窗口大小变化
      let self = this;
      window.onresize = function () {
        self.tableHeight = window.innerHeight - self.$refs.table.$el.offsetTop -
          this.$refs.queryForm.$el.offsetTop
      }
    })
  },
  methods: {
    /** 查询任务明细列表 */
    getList() {
      this.loading = true;
      listTaskDetail(this.queryParams).then(response => {
        this.taskDetailList = response.rows;
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
        taskId: undefined,
        name: undefined,
        method: undefined,
        param: undefined,
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
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加任务明细";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.loading = true;
      this.reset();
      const id = row.id || this.ids
      getTaskDetail(id).then(response => {
        this.loading = false;
        this.form = response.data;
        this.open = true;
        this.title = "修改任务明细";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.buttonLoading = true;
          if (this.form.id != null) {
            updateTaskDetail(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).finally(() => {
              this.buttonLoading = false;
            });
          } else {
            addTaskDetail(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除任务明细编号为"' + ids + '"的数据项？').then(() => {
        this.loading = true;
        return delTaskDetail(ids);
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
      this.download('export/taskDetail/export', {
        ...this.queryParams
      }, `taskDetail_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
