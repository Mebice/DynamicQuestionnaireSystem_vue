<script>
import Swal from 'sweetalert2'
export default {
    data() {
        return {
            formData: {
                question: '',
                questionType: '',
                isNecessary: true,
                options: '',
            },
            tableData: [], // 存儲表格中的數據
            isEditing: false,
            editedQuestionIndex: null,
            scrollPosition: 0
        };
    },
    created() {
        // 在组件创建时尝试从 localStorage 恢复数据
        const storedData = localStorage.getItem('tableData');

        // 检查路由状态，如果是由上一步返回的，不清空 localStorage
        if (storedData && this.$route.name !== 'BackstageQuestionnaire') {
            this.tableData = JSON.parse(storedData);
        } else {
            localStorage.removeItem('tableData');
        }
    },
    mounted() {
        // 在組件被創建時恢復 localStorage 中的數據
        this.restoreTableDataFromLocalStorage();
    },

    methods: {


        addToTable() {
            // 檢查必填字段是否為空
            if (!this.formData.question || !this.formData.questionType || !this.formData.options) {
                Swal.fire({
                    title: '請將題目、類型、選項填寫完整',
                    text: '題目、類型、選項不得為空。',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: '確定'
                });
                return; // 如果有任何一項為空，停止執行
            }
            // 檢查選項至少有兩個
            const optionsArray = this.formData.options.split(';').map(option => option.trim());
            if (optionsArray.length < 2) {
                Swal.fire({
                    title: '選項至少兩項',
                    text: '選項不得少於兩項。',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: '確定'
                });
                return;
            }

            // 將表單數據添加到 tableData 中
            this.tableData.push({
                question: this.formData.question,
                questionType: this.formData.questionType,
                isNecessary: this.formData.isNecessary,
                options: optionsArray,  // 將選項數據也添加進去
                isSelected: false, // 新增 isSelected 屬性，用於標記是否被選中
            });
            // 存入 localStorage
            this.saveTableDataToLocalStorage();

            // 清空表單數據
            this.formData = {
                question: '',
                questionType: '',
                isNecessary: true,
                options: ''
            };
            // 滾動到畫面底部
            window.scrollTo(0, document.body.scrollHeight);

            Swal.fire({
                title: '新增題目成功',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: '確定'
            });
            return;

        },
        deleteSelected() {
            // 找到被選中的題目的索引
            const selectedIndexes = this.tableData
                .map((item, index) => ({ ...item, index }))
                .filter((item) => item.isSelected)
                .map((item) => item.index)
                .sort((a, b) => b - a);

            // 如果沒有選中項目，提示使用者選擇要刪除的項目
            if (selectedIndexes.length === 0) {
                Swal.fire({
                    title: '請選擇要刪除的題目',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: '確定'
                });
                return;
            }

            // 獲取選中的題目編號和標題
            const selectedQuestions = selectedIndexes.map((index) => ({
                number: index + 1,
                title: this.tableData[index].question
            })).reverse();
            // 顯示確認對話框
            Swal.fire({
                title: '確定刪除選中的題目嗎？',
                html: selectedQuestions.map(({ number, title }) => `<div style="text-align: left;">${number}. ${title}</div>`).join(''),
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '確定',
                cancelButtonText: '取消'
            }).then((result) => {
                // 如果使用者確定要刪除，執行刪除操作
                if (result.isConfirmed) {

                    // 刪除被選中的題目
                    selectedIndexes.forEach((index) => {
                        this.tableData.splice(index, 1);
                    });
                    // 使用 $nextTick 來確保 DOM 已經更新完畢再執行後續的操作
                    this.$nextTick(() => {
                        // 存入 localStorage
                        this.saveTableDataToLocalStorage();
                    });
                    Swal.fire({
                        title: '刪除題目成功',
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: '確定'
                    });
                    return;

                } else {
                    // 如果使用者取消刪除，重置 isSelected 狀態
                    this.tableData.forEach((item) => {
                        item.isSelected = false;
                    });
                }
            })
        },

        editRow(index) {
            this.isEditing = true;
            this.editedQuestionIndex = index;

            // 記錄當前滾動位置
            this.scrollPosition = window.scrollY;

            // 填充表單數據為要編輯的題目資料
            const editedQuestion = this.tableData[index];
            this.formData.question = editedQuestion.question;
            this.formData.questionType = editedQuestion.questionType;
            this.formData.isNecessary = editedQuestion.isNecessary;
            this.formData.options = editedQuestion.options.join('; ');

            // 滾動到最上方
            window.scrollTo(0, 0);
        },
        saveEdit() {
            // 檢查必填字段是否為空
            if (!this.formData.question || !this.formData.questionType || !this.formData.options) {
                Swal.fire({
                    title: '請將題目、類型、選項填寫完整',
                    text: '題目、類型、選項不得為空。',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: '確定'
                });
                return; // 如果有任何一項為空，停止執行
            }
            // 檢查選項至少有兩個
            const optionsArray = this.formData.options.split(';').map(option => option.trim());
            if (optionsArray.length < 2) {
                Swal.fire({
                    title: '選項至少兩項',
                    text: '選項不得少於兩項。',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: '確定'
                });
                return;
            }


            // 更新正在編輯的題目資料
            const editedQuestion = this.tableData[this.editedQuestionIndex];
            editedQuestion.question = this.formData.question;
            editedQuestion.questionType = this.formData.questionType;
            editedQuestion.isNecessary = this.formData.isNecessary;
            editedQuestion.options = this.formData.options.split(';').map(option => option.trim());

            // 重置表單數據
            this.formData = {
                question: '',
                questionType: '',
                isNecessary: true,
                options: ''
            };

            // 退出編輯模式
            this.isEditing = false;

            // 存入 localStorage
            this.saveTableDataToLocalStorage();

            // 還原滾動位置
            window.scrollTo(0, this.scrollPosition);

            Swal.fire({
                title: '儲存變更',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: '確定'
            });

        },
        cancelEdit() {
            Swal.fire({
                title: '放棄變更？',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '確定',
                cancelButtonText: '取消'
            }).then((result) => {
                if (result.isConfirmed) {

                    // 清空表單數據
                    this.formData = {
                        question: '',
                        questionType: '',
                        isNecessary: true,
                        options: ''
                    };

                    // 退出編輯模式
                    this.isEditing = false;

                    // 還原滾動位置
                    window.scrollTo(0, this.scrollPosition);
                }
            })
        },
        moveToPreviousPage() {
            // 跳轉到上一個頁面
            this.$router.push('/BackstageQuestionnaire');
        },
        moveToConfirmPage() {
            // 檢查是否有新增題目
            if (this.tableData.length === 0) {
                Swal.fire({
                    title: '請新增至少一個題目',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: '確定'
                });
                return;
            }
            // 跳轉到確認頁面
            this.$router.push('/BackstageConfirm');
        },
        saveTableDataToLocalStorage() {
            // 將 tableData 轉為 JSON 字串，然後存入 localStorage
            const tableDataJson = JSON.stringify(this.tableData);
            localStorage.setItem('tableData', tableDataJson);
        },
        restoreTableDataFromLocalStorage() {
            // 從 local storage 中獲取 tableData 的 JSON 字串
            const tableDataJson = localStorage.getItem('tableData');

            // 如果存在，將其轉為對象並賦值給組件的 tableData
            if (tableDataJson) {
                this.tableData = JSON.parse(tableDataJson);
            }
        },

    },
};
</script>
<template>
    <div class="bgArea">
        <div class="content-block">
            <div class="input-row">
                <label for="question">問題：</label>
                <input class="titleInput" type="text" name="question" v-model="formData.question">
            </div>
            <div class="input-row">
                <label for="questionType">類型：</label>
                <select name="questionType" v-model="formData.questionType">
                    <option value="單選">單選</option>
                    <option value="多選">多選</option>
                </select>
            </div>
            <div class="input-row">
                <input type="checkbox" name="isNecessary" id="isNecessary" v-model="formData.isNecessary">
                <label for="isNecessary">必填</label>
            </div>
            <div class="input-row">
                <label for="options">選項：</label>
                <textarea v-model="formData.options"></textarea>
                <span>多個答案以 ; 分隔</span>
            </div>



            <div class="icon">
                <!-- 添加題目 -->
                <i v-if="!isEditing" class="fa-solid fa-plus" @click="addToTable"></i>
                <!-- <i class="fa-solid fa-plus" @click="addToTable"></i> -->
                <!-- 取消編輯 -->
                <i v-if="isEditing" class="fa-solid fa-delete-left" @click="cancelEdit"></i>
                <!-- 保存編輯 -->
                <i v-if="isEditing" class="fa-solid fa-floppy-disk" @click="saveEdit"></i>
                <!-- 使用垃圾桶按鈕刪除選中的題目 -->
                <i v-if="tableData.length > 0" class="fa-solid fa-trash-can" @click="deleteSelected"></i>
            </div>
            <!-- 顯示問題列表 -->
            <table v-if="tableData.length > 0" id="questionTable">
                <tr>
                    <th>刪除</th>
                    <th>#</th>
                    <th>問題</th>
                    <th>類型</th>
                    <th>必填</th>
                    <th>選項</th>
                    <th>編輯</th>
                </tr>
                <tr v-for="(item, index) in tableData" :key="index">
                    <td><input type="checkbox" v-model="item.isSelected"></td>
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.question }}</td>
                    <td>{{ item.questionType }}</td>
                    <td>{{ item.isNecessary ? '是' : '否' }}</td>
                    <td>{{ item.options.join(';') }}</td>
                    <td><i class="fa-solid fa-pen" @click="editRow(index)"></i></td>
                </tr>

            </table>

            <!-- <div v-if="isEditing">
                <h2>編輯題目</h2>
                <form>
                    <label for="editQuestion">問題：</label>
                    <input type="text" name="editQuestion" v-model="formData.question">

                    <label for="editQuestionType">類型：</label>
                    <select name="editQuestionType" v-model="formData.questionType">
                        <option value="單選">單選</option>
                        <option value="多選">多選</option>
                    </select>

                    <input type="checkbox" name="editIsNecessary" id="editIsNecessary" v-model="formData.isNecessary">
                    <label for="editIsNecessary">必填</label>

                    <label for="editOptions">選項：</label>
                    <input type="text" name="editOptions" v-model="formData.options">
                    <p>多個答案以 ; 分隔</p>

                    <button @click="saveEdit">保存編輯</button>
                </form>
            </div> -->

            <div class="iconBottom">
                <i class="fa-solid fa-arrow-left" @click="moveToPreviousPage"></i>
                <i class="fa-solid fa-arrow-right" @click="moveToConfirmPage"></i>
            </div>
            <!-- <div class="buttons">
                <button class="btn" @click="moveToPreviousPage">上一步</button>
                <button class="btn" @click="moveToConfirmPage">送出</button>
            </div> -->
        </div>
    </div>
</template>



<style lang="scss" scoped>
$maincolor: #A4804C;

.bgArea {
    width: 100vw;
    background-color: #f4f4ed;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 82px 0;


    .content-block {
        width: 900px;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #fff;
        color: #6e4e23;
    }


    .input-row {
        display: flex;
        align-items: center;
        width: 100%;
        margin-bottom: 10px;
        margin-left: 460px;
    }

    .titleInput {
        width: 300px;
    }

    textarea {
        height: 100px;
        width: 300px;
        resize: none;
        margin-right: 10px;
    }


    table {
        width: 900px;
        font-family: 'Oswald', sans-serif;
        margin-top: 30px;

        th {
            background-color: $maincolor;
            color: #ffffff;
            width: 25vw;
            height: 5vh;
            text-align: center;
        }

        td {
            color: #6e4e23;
            background-color: #ffffff;
            width: 25vw;
            height: 5vh;
            text-align: center;
            word-break: break-all; //換行
        }

        tr {
            border-bottom: 1px solid #dddddd;
        }

        tr:last-of-type {
            border-bottom: 2px solid $maincolor;
        }

        tr:nth-of-type(even) td {
            background-color: #f3f3f3;
        }

    }

    .fa-trash-can {
        color: $maincolor;
        position: absolute;
        left: 220px;
        top: 400px;
        font-size: 2vw;

        &:hover {
            cursor: pointer;
            color: #DBD3A4;
        }
    }

    .fa-plus,
    .fa-floppy-disk,
    .fa-delete-left {
        color: $maincolor;
        margin-right: 10px;
        font-size: 20pt;
        padding: 0 100px;

        &:hover {
            cursor: pointer;
            color: #DBD3A4;
        }
    }

    .fa-pen {
        color: $maincolor;
        display: flex;
        justify-content: center;

        &:hover {
            cursor: pointer;
            color: #DBD3A4;
        }

    }

    .iconBottom {
        width: 800px;
        display: flex;
        justify-content: space-between;
        margin-top: 20px;

        .fa-arrow-left {
            color: rgba(161, 158, 158, 0.804);
            background-color: rgba(211, 211, 211, 0.804);
            font-size: 20pt;
            transition: all 0.5s ease;
            border-radius: 50%;
            padding: 12px;
            position: relative;

            &:hover {
                background-color: rgba(143, 143, 143, 0.804);
                cursor: pointer;
            }

            /* 使用伪元素添加文字 */
            &::after {
                content: '上一頁';
                color: rgb(255, 255, 255);
                font-size: 10pt;
                display: block;
                position: absolute;
                top: 50%;
                /* 相对于父元素垂直居中 */
                left: 50%;
                /* 相对于父元素水平居中 */
                transform: translate(-50%, -50%);
                /* 平移并旋转文字 */
                opacity: 0;
                /* 初始状态透明 */
                transition: opacity 0.3s ease;
                /* 添加过渡效果 */
                white-space: nowrap;
                /* 防止文字换行 */
            }

            &:hover::after {
                opacity: 1;
            }
        }

        .fa-arrow-right {
            color: rgba(161, 158, 158, 0.804);
            background-color: rgba(211, 211, 211, 0.804);
            font-size: 20pt;
            transition: all 0.5s ease;
            border-radius: 50%;
            padding: 12px;
            position: relative;

            &:hover {
                background-color: rgba(143, 143, 143, 0.804);
                cursor: pointer;
            }

            /* 使用伪元素添加文字 */
            &::after {
                content: '下一頁';
                color: rgb(255, 255, 255);
                font-size: 10pt;
                display: block;
                position: absolute;
                top: 50%;
                /* 相对于父元素垂直居中 */
                left: 50%;
                /* 相对于父元素水平居中 */
                transform: translate(-50%, -50%);
                /* 平移并旋转文字 */
                opacity: 0;
                /* 初始状态透明 */
                transition: opacity 0.3s ease;
                /* 添加过渡效果 */
                white-space: nowrap;
                /* 防止文字换行 */
            }

            &:hover::after {
                opacity: 1;
            }
        }
    }
}
</style>
