<script>
import CheckSquare from './icons/check-square.vue';
import Square from './icons/square.vue';
import Pencil from './icons/pencil.vue';
import Trash from './icons/trash.vue';
import PlusCircle from './icons/plus-circle.vue';
import SwitchVertical from './icons/switch-vertical.vue';
import Circle from './icons/circle.vue';
import RecordCircle from './icons/record-circle.vue';
import ChevronRight from './icons/chevron-right.vue';
import ChevronBottom from './icons/chevron-bottom.vue';

export default {
  data() {
    return {
      data: {
        version: 1,
        // todos: [
        //   // NOTE: This is just a test object for development.
        //   {
        //     id: 987192045632,
        //     content: 'Hello World!',
        //     date: 1659877289968,
        //     completed: false,
        //   },
        //   {
        //     id: 526919297563,
        //     content: 'Drink a glass of water',
        //     date: 1659808439557,
        //     completed: false,
        //   },
        //   {
        //     id: 552267099247,
        //     content: 'Wash the dishes',
        //     date: 1659808434612,
        //     completed: true,
        //   },
        //   {
        //     id: 393829242937,
        //     content: 'Buy Minecraft Java&Bedrock Edition',
        //     date: 1659808426168,
        //     completed: false,
        //   },
        //   {
        //     id: 864336467614,
        //     content: "Finish Plato's Republic",
        //     date: 1659808404208,
        //     completed: false,
        //   },
        //   {
        //     id: 604908128095,
        //     content: "Finish Sofie's World",
        //     date: 1659808379333,
        //     completed: true,
        //   },
        // ],
        todos: [],
        preferences: {
          theme: 'os' /* light, dark, os */,
          sortType: 'date' /* date, name */,
          sortDesc: false,
          hideBanner: false,
          hideCompletedTodos: false,
          date: 'hide' /* hide, date, time, full */,
        },
      },
      cache: {
        activeTodos: undefined,
        expandPreferences: false,
        currentContent: '',
      },
    };
  },
  beforeCreate() {
    // localStorage.getItem('data')
    //   ? (this.data = JSON.parse(localStorage.getItem('data')))
    //   : localStorage.setItem('data', JSON.stringify(this.data));

    ///////////////////////////////////////////////////////////////
    /* Some fixes for datas from old versions (v1.1.0 and below) */
    if (localStorage.getItem('data')) {
      let checkObj = JSON.parse(localStorage.getItem('data'));

      if (!checkObj.version || checkObj.version < 1) {
        console.log("Old version detected. We're working on data object.");
        this.data = {};
        this.data.todos = JSON.parse(localStorage.getItem('data'));
        this.data.preferences = {};
        this.data.preferences.hideBanner = JSON.parse(localStorage.getItem('hideBanner'));
        /* prettier-ignore */
        this.data.preferences.hideCompletedTodos = JSON.parse(localStorage.getItem('hideCompletedTodos'));
        this.data.preferences.theme = JSON.parse(localStorage.getItem('theme'));
        this.data.preferences.sortType = JSON.parse(localStorage.getItem('sort'))[0];
        JSON.parse(localStorage.getItem('sort'))[1] === 'desc'
          ? (this.data.preferences.sortDesc = true)
          : (this.data.preferences.sortDesc = false);

        this.data.version = 1;
        ///////////////////////////////////////////////////////////////

        localStorage.removeItem('hideBanner');
        localStorage.removeItem('hideCompletedTodos');
        localStorage.removeItem('theme');
        localStorage.removeItem('sort');

        localStorage.setItem('data', JSON.stringify(this.data));
      }
    }
  },
  created() {
    localStorage.getItem('data')
      ? (this.data = JSON.parse(localStorage.getItem('data')))
      : localStorage.setItem('data', JSON.stringify(this.data));
  },
  mounted() {
    switch (this.data.preferences.theme) {
      case 'os':
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? document.querySelector('html').classList.add('dark')
          : document.querySelector('html').classList.remove('dark');
        break;
      case 'light':
        document.querySelector('html').classList.remove('dark');
        break;
      case 'dark':
        document.querySelector('html').classList.add('dark');
        break;
    }

    this.data.preferences.sortDesc
      ? this.sortTodosByDateDesc()
      : this.sortTodosByDateAsc();

    this.hideCompletedTodosHandler();
  },
  methods: {
    /**
     * @param {Number} id - ID property of object in todos array
     * @description - Sets true if the completed property of the selected to-do object is false, false if true.
     */
    toggleStatus(id) {
      this.data.todos.find(todo => todo.id === id).completed = !this.data.todos.find(
        todo => todo.id === id
      ).completed;
      this.saveToLocalStorage();
    },
    /**
     * @param {String} content - Content of the todo (content input will be taken from user)
     */
    addTodo() {
      if (this.cache.currentContent === '') this.cache.currentContent = 'Blank to-do';
      let newTodo = {
        id: Math.round(Math.random() * 1000000000000),
        content: this.cache.currentContent,
        date: Date.now(),
        completed: false,
      };

      this.data.preferences.sortDesc
        ? this.data.todos.unshift(newTodo)
        : this.data.todos.push(newTodo);
      this.hideCompletedTodosHandler();

      this.cache.currentContent = '';
      this.saveToLocalStorage();
    },
    /**
     * @param {Number} id - ID property of the todo
     */
    // editTodo(id) {
    //   this.todos.find(todo => todo.id === id).editMode = !this.todos.find(
    //     todo => todo.id === id
    //   ).editMode;
    // },
    /**
     * @param {Number} id - ID property of the todo
     */
    removeTodo(id) {
      this.data.todos.splice(
        this.data.todos.findIndex(todo => {
          return todo.id === id;
        }),
        1
      );
      this.hideCompletedTodosHandler();
      this.saveToLocalStorage();
    },
    formatDate(date) {
      switch (this.data.preferences.date) {
        case 'date':
          return new Date(date).toLocaleDateString();
        case 'time':
          return new Date(date).toLocaleTimeString();
        case 'full':
          return new Date(date).toLocaleString();
        default:
          return '';
      }
    },
    sortTodosByDateAsc() {
      this.data.preferences.sortDesc = false;
      this.data.todos.sort((a, b) => parseFloat(a.date) - parseFloat(b.date));
      this.hideCompletedTodosHandler();
      this.saveToLocalStorage();
    },
    sortTodosByDateDesc() {
      this.data.preferences.sortDesc = true;
      this.data.todos.sort((a, b) => parseFloat(b.date) - parseFloat(a.date));
      this.hideCompletedTodosHandler();
      this.saveToLocalStorage();
    },
    sortTodosByNameAsc() {
      this.data.preferences.sortDesc = false;
      this.saveToLocalStorage();
    },
    sortTodosByNameDesc() {
      this.data.preferences.sortDesc = true;
      this.saveToLocalStorage();
    },
    // rearrangeTodos() {},
    hideCompletedTodosHandler() {
      this.cache.activeTodos = this.data.todos.filter(todo => !todo.completed);
    },
    saveToLocalStorage() {
      localStorage.setItem('data', JSON.stringify(this.data));
    },
    // myFunc() {},
  },
  components: {
    CheckSquare,
    Square,
    Pencil,
    Trash,
    PlusCircle,
    SwitchVertical,
    Circle,
    RecordCircle,
    ChevronRight,
    ChevronBottom,
  },
};
</script>

<template>
  <div class="p-6 md:p-12 gap-6 md:gap-12 flex flex-col">
    <div class="w-full flex flex-col gap-3">
      <div>
        <h1 class="text-4xl font-bold dark:text-gray-200">Crema To-Do</h1>
      </div>
      <p v-if="this.data.todos.length === 0" class="dark:text-gray-300">
        You didn't add any to-do. To create your first to-do, type below then hit enter or
        the + sign.
      </p>
      <!-- <div class="w-full flex gap-3 md:gap-6 mb-3">
        <div class="w-1/12 flex justify-center">Status</div>
        <div class="w-9/12">Content</div>
        <div class="w-1/12 flex gap-3 justify-center">Operations</div>
      </div> -->
      <div class="w-full flex gap-3 md:gap-6" v-else>
        <div class="w-1/12 flex justify-center"></div>
        <div class="w-10/12"></div>
        <div class="w-1/12 flex gap-3 justify-center">
          <a
            href="#"
            @click="
              this.data.preferences.sortDesc
                ? sortTodosByDateAsc()
                : sortTodosByDateDesc()
            "
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
          >
            <!-- SORT &uarr;&darr; -->
            <SwitchVertical />
          </a>
        </div>
      </div>
      <div
        class="w-full flex gap-3 md:gap-6"
        v-if="!this.data.preferences.hideCompletedTodos"
        v-for="todo in data.todos"
      >
        <div class="w-1/12 flex justify-center">
          <a
            href="#"
            v-if="todo.completed"
            @click="toggleStatus(todo.id)"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
          >
            <CheckSquare />
          </a>
          <a
            href="#"
            v-else="todo.completed"
            @click="toggleStatus(todo.id)"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
          >
            <Square />
          </a>
        </div>
        <div class="w-10/12">
          <input
            type="text"
            :name="todo.id"
            :id="todo.id"
            v-model="todo.content"
            class="w-full dark:bg-gray-800 dark:text-gray-300"
            :class="todo.completed ? 'line-through text-gray-500 dark:text-gray-600' : ''"
            v-on:change="saveToLocalStorage"
          />
          <!-- {{ todo.content }} -->
        </div>
        <div v-if="this.data.preferences.date !== 'hide'">
          <div class="w-2/12 text-xs text-end">
            {{ formatDate(todo.date) }}
          </div>
        </div>
        <div class="w-1/12 flex gap-3 justify-center">
          <!-- <a href="#" @click="editTodo(todo.id)">
            <Pencil />
          </a> -->
          <a
            href="#"
            @click="removeTodo(todo.id)"
            class="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
          >
            <Trash />
          </a>
        </div>
      </div>
      <div
        class="w-full flex gap-3 md:gap-6"
        v-if="this.data.preferences.hideCompletedTodos"
        v-for="todo in cache.activeTodos"
      >
        <div class="w-1/12 flex justify-center">
          <a
            href="#"
            v-if="todo.completed"
            @click="toggleStatus(todo.id)"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
          >
            <CheckSquare />
          </a>
          <a
            href="#"
            v-else="todo.completed"
            @click="toggleStatus(todo.id)"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
          >
            <Square />
          </a>
        </div>
        <div class="w-8/12">
          <input
            type="text"
            :name="`input-${todo.id}`"
            :id="`input-${todo.id}`"
            v-model="todo.content"
            class="w-full dark:bg-gray-800 dark:text-gray-300"
            :class="todo.completed ? 'line-through text-gray-500 dark:text-gray-600' : ''"
            v-on:change="saveToLocalStorage"
          />
          <!-- {{ todo.content }} -->
        </div>
        <div class="w-2/12 text-xs text-end" v-if="this.data.preferences.date !== 'hide'">
          <p>{{ formatDate(todo.date) }}</p>
        </div>
        <div class="w-1/12 flex gap-3 justify-center">
          <!-- <a href="#" @click="editTodo(todo.id)">
            <Pencil />
          </a> -->
          <a
            href="#"
            @click="removeTodo(todo.id)"
            class="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
          >
            <Trash />
          </a>
        </div>
      </div>

      <div class="w-full flex gap-3 md:gap-6">
        <div class="w-1/12 flex justify-center"></div>
        <div class="w-10/12">
          <input
            type="text"
            name="todoContent"
            id="todoContent"
            class="rounded w-full bg-gray-100 dark:bg-gray-700 dark:text-white px-3"
            v-model="cache.currentContent"
            v-on:keyup.enter="addTodo"
            placeholder="Add new todo from here..."
          />
        </div>
        <div class="w-1/12 flex gap-3 justify-center">
          <a
            href="#"
            @click="addTodo"
            class="text-gray-700 dark:text-gray-200 hover:text-green-700 dark:hover:text-green-200 transition-all duration-200"
          >
            <PlusCircle />
          </a>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-6">
      <a href="#" @click="this.cache.expandPreferences = !this.cache.expandPreferences">
        <h2
          class="text-md text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3"
        >
          <ChevronBottom v-if="this.cache.expandPreferences" />
          <ChevronRight v-else /> Preferences
        </h2>
      </a>
      <div class="flex flex-col gap-6" v-if="this.cache.expandPreferences">
        <div class="flex gap-6">
          <p class="dark:text-gray-400 text-sm">Theme:</p>
          <a
            href="#"
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              this.data.preferences.theme = 'os';
              this.saveToLocalStorage();
            "
          >
            <RecordCircle v-if="this.data.preferences.theme === 'os'" />
            <Circle v-else />
            <p>System</p>
          </a>
          <a
            href="#"
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              this.data.preferences.theme = 'light';
              this.saveToLocalStorage();
            "
          >
            <RecordCircle v-if="this.data.preferences.theme === 'light'" />
            <Circle v-else />
            <p>Light</p>
          </a>
          <a
            href="#"
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              this.data.preferences.theme = 'dark';
              this.saveToLocalStorage();
            "
          >
            <RecordCircle v-if="this.data.preferences.theme === 'dark'" />
            <Circle v-else />
            <p>Dark</p>
          </a>
        </div>
        <p class="dark:text-gray-400 text-sm">
          NOTE: After changing the theme, you need to refresh the page.
        </p>
        <a
          href="#"
          class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
          @click="
            this.data.preferences.hideBanner = !this.data.preferences.hideBanner;
            this.saveToLocalStorage();
          "
        >
          <CheckSquare v-if="this.data.preferences.hideBanner" height="20" width="20" />
          <Square v-else height="20" width="20" />
          <p>Hide "Created by" banner</p>
        </a>
        <a
          href="#"
          class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
          @click="
            this.data.preferences.hideCompletedTodos =
              !this.data.preferences.hideCompletedTodos;
            this.saveToLocalStorage();
            this.hideCompletedTodosHandler();
          "
        >
          <CheckSquare
            v-if="this.data.preferences.hideCompletedTodos"
            height="20"
            width="20"
          />
          <Square v-else height="20" width="20" />
          <p>Hide completed todos</p>
        </a>
      </div>
    </div>
    <!-- <div>
      <h1 class="text-2xl gap-12 font-bold mb-6">Add new to-do</h1>
      <div class="flex gap-3">
        <label for="todoContent" class="my-2 hidden md:inline-block">Content</label>
        <input
          type="text"
          name="todoContent"
          id="todoContent"
          class="rounded w-full bg-gray-100 px-3"
          v-model="currentContent"
          v-on:keyup.enter="addTodo"
        />
        <button
          type="submit"
          class="bg-green-300 px-5 py-2 rounded"
          @click="addTodo"
        >
          Add
        </button>
        <a href="#" class="my-2" @click="addTodo">
          <PlusCircle />
        </a>
      </div>
    </div> -->
  </div>
  <a
    v-if="!this.data.preferences.hideBanner"
    target="_blank"
    href="https://github.com/ubeydeozdmr/crema-todo"
    class="rounded text-xs text-center w-full bg-gray-200 dark:bg-gray-700 dark:text-gray-300 fixed bottom-0 left-0"
  >
    Created by Ubeyde Emir Özdemir with ❤️ Click for GitHub link
  </a>
  <!-- <button
    @click="myFunc"
    class="rounded text-sm bg-gray-200 absolute bottom-0 right-0"
  >
    Take a log for console (Just for development)
  </button> -->
</template>

<style scoped></style>
